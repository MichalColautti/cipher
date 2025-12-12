import MessageBubble from "@/components/messageBubble";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { uploadImage } from "@/services/imageService";
import * as ImagePicker from "expo-image-picker";

import CryptoJS from "crypto-js";
import { Alert, Platform } from "react-native";

import { runBackgroundKeygen } from "@/services/backgroundKeygen";
import {
  aesDecryptFromBase64,
  aesEncryptToBase64,
  getPrivateKey,
  rsaDecryptBase64,
  rsaEncryptBase64,
  savePrivateKey,
} from "@/services/cryptoService";
import { clearCachedMessage, loadAllCachedForChat, loadCachedDecryptedMessage, saveDecryptedMessage } from "@/services/messageCache";

import { useLocalSearchParams, useRouter } from "expo-router";
import ImageViewing from "react-native-image-viewing";

import {
  addDoc,
  collection,
  doc, getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AttachmentIcon from "../../assets/icons/attachment.svg";
import BackIcon from "../../assets/icons/back.svg";
import CallIcon from "../../assets/icons/call.svg";
import CloseIcon from "../../assets/icons/close.svg";
import SearchIcon from "../../assets/icons/search.svg";
import SendIcon from "../../assets/icons/send.svg";

async function decryptSingleMessage(rawMsgDoc, myId, privateKeyPem, aesKeyCacheMap) {
  console.log("Decrypting message ID:", rawMsgDoc.id);
  try {
    if (!rawMsgDoc.encryptedKeys || !rawMsgDoc.ciphertext || !rawMsgDoc.iv) {
      return { ...rawMsgDoc, text: rawMsgDoc.text ?? null };
    }

    const cached = aesKeyCacheMap.get(rawMsgDoc.id);
    let aesKeyBase64 = cached;

    if (!aesKeyBase64) {
      const encryptedKeyForMe = rawMsgDoc.encryptedKeys[myId];
      if (!encryptedKeyForMe) return { ...rawMsgDoc, text: "(cannot decrypt)" };
      if (!privateKeyPem) return { ...rawMsgDoc, text: "(cannot decrypt)" };

      aesKeyBase64 = await rsaDecryptBase64(encryptedKeyForMe, privateKeyPem);
      aesKeyCacheMap.set(rawMsgDoc.id, aesKeyBase64);
    }

    const plaintext = aesDecryptFromBase64(rawMsgDoc.ciphertext, aesKeyBase64, rawMsgDoc.iv);
    return { ...rawMsgDoc, text: plaintext };
  } catch (err) {
    console.error("Failed to decrypt message:", err);
    return { ...rawMsgDoc, text: "(failed to decrypt)" };
  }
}

async function getDecryptedOrCached(raw, myId, privateKeyPem, aesKeyCacheMap, chatRoomId) {
  try {
    const cached = await loadCachedDecryptedMessage({
      chatRoomId: chatRoomId,
      messageId: raw.id,
      ciphertext: raw.ciphertext,
      iv: raw.iv,
      userId: myId
    });

    let plaintext = cached ?? null;

    const dec = plaintext
      ? { ...raw, text: plaintext }
      : await decryptSingleMessage(raw, myId, privateKeyPem, aesKeyCacheMap);  

    if (!dec.text) dec.text = "(cannot decrypt)";

    if (!cached && dec.text && dec.text !== "(cannot decrypt)" && dec.text !== "(failed to decrypt)") {
      await saveDecryptedMessage({
        chatRoomId,
        messageId: raw.id,
        plaintext: dec.text,
        ciphertext: raw.ciphertext,
        iv: raw.iv,
        createdAtMs: raw.clientCreatedAt || raw.createdAt?.toMillis?.() || Date.now(),
        userId: myId,
        senderId: dec.senderId,
      });
    }

    return dec;
  } catch (e) {
    console.error("getDecryptedOrCached error", e);
    return await decryptSingleMessage(raw, myId, privateKeyPem, aesKeyCacheMap);
  }
}

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef(null);

  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [otherUserProfile, setOtherUserProfile] = useState(null);

  const triggerSearch = params.triggerSearch;
  const chatRoomId = params.roomId ? String(params.roomId) : null;
  const contactName = params.contactName ? String(params.contactName) : null;
  const contactImage = params.contactImage ? String(params.contactImage) : null;
  const myId = user?.id ?? user?.uid;

  const outgoingQueueRef = useRef([]); 
  const sendingRef = useRef(false);

  const messagesMapRef = useRef(new Map());       
  const aesKeyCacheRef = useRef(new Map());       
  const privateKeyRef = useRef(null);            
  const pendingLocalByClientCreatedAt = useRef(new Map());
  const shouldAutoScrollRef = useRef(false);     

  const toMillisFromDoc = (docObj) => {
    if (!docObj) return Date.now();
    const ts = docObj.createdAt;
    if (ts && typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof docObj.clientCreatedAt === "number") return docObj.clientCreatedAt;
    if (typeof ts === "number") return ts;
    if (ts && typeof ts.getTime === "function") return ts.getTime();
    return Date.now();
  };

  const sortMessagesAsc = (arr) =>
    arr.sort((a, b) => toMillisFromDoc(a) - toMillisFromDoc(b));

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (triggerSearch === 'true') {
      setIsSearchActive(true);
    }
  }, [triggerSearch]);

  useEffect(() => {
    if (!user || !chatRoomId) return;

    let unsubscribe;

    (async () => {
      try {
        const pk = await getPrivateKey(myId);
        privateKeyRef.current = pk;

        try {
          const cachedMap = await loadAllCachedForChat({ chatRoomId, userId: myId });
          for (const [msgId, entry] of Object.entries(cachedMap)) {
            messagesMapRef.current.set(msgId, {
              id: msgId,
              text: entry.text,
              createdAt: { toMillis: () => entry.createdAtMs || Date.now() },
              senderId: entry.senderId ?? null,
            });
          }
          shouldAutoScrollRef.current = true;
          setMessages(sortMessagesAsc(Array.from(messagesMapRef.current.values())));
        } catch (cacheErr) {
          console.warn("Failed to preload cached messages:", cacheErr);
        }
      } catch (e) {
        console.warn("Could not load private key:", e);
      }
    })();

    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    try {
      unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
          console.log("Received", querySnapshot.docChanges().length, "message changes");
          const changes = querySnapshot.docChanges();
          let mapChanged = false;

          for (const change of changes) {
            try {
              const docSnap = change.doc;
              const data = docSnap.data();
              const raw = { id: docSnap.id, ...data };

              raw.clientCreatedAt = raw.clientCreatedAt != null ? Number(raw.clientCreatedAt) : null;

              if (!raw.createdAt) {
                raw.createdAt = { toMillis: () => raw.clientCreatedAt ?? Date.now() };
              }

              if (change.type === "removed") {
                if (messagesMapRef.current.has(raw.id)) {
                  messagesMapRef.current.delete(raw.id);
                  aesKeyCacheRef.current.delete(raw.id);
                  mapChanged = true;
                }
                try { await clearCachedMessage(chatRoomId, raw.id); } catch (e) { console.warn(e); }
                continue;
              }

              if (raw.senderId === myId && raw.clientCreatedAt != null) {
                let localId = pendingLocalByClientCreatedAt.current.get(raw.clientCreatedAt);

                if (!localId) {
                  for (const [id, msg] of messagesMapRef.current.entries()) {
                    if (msg.senderId !== myId) continue;
                    if (msg.status !== "pending") continue;
                    if (Number(msg.clientCreatedAt) === raw.clientCreatedAt) {
                      localId = id;
                      break;
                    }
                  }
                }

                if (localId) {
                  console.log("Matching server message", raw.id, "to local optimistic", localId);
                  const localMsg = messagesMapRef.current.get(localId);
                  messagesMapRef.current.delete(localId);
                  messagesMapRef.current.set(raw.id, {
                    ...localMsg,
                    id: raw.id,
                    createdAt: raw.createdAt,
                    status: "sent"
                  });
                  pendingLocalByClientCreatedAt.current.delete(raw.clientCreatedAt);
                  try { await clearCachedMessage(chatRoomId, localId); } catch (e) { /* ignore */ }
                  mapChanged = true;
                  continue;
                }
              }

              const decrypted = await getDecryptedOrCached(raw, myId, privateKeyRef.current, aesKeyCacheRef.current, chatRoomId);
              if (!decrypted.text) decrypted.text = "(cannot decrypt)";
              messagesMapRef.current.set(raw.id, { ...decrypted, createdAt: raw.createdAt });

              if (raw.clientCreatedAt) {
                const keysToDelete = [];
                for (const [k, m] of messagesMapRef.current.entries()) {
                  if (k.startsWith("local_") && m.senderId === myId && Number(m.clientCreatedAt) === Number(raw.clientCreatedAt)) {
                    keysToDelete.push(k);
                  }
                }
                keysToDelete.forEach(k => messagesMapRef.current.delete(k));
                if (keysToDelete.length > 0) mapChanged = true;
              }

              mapChanged = true;
            } catch (changeErr) {
              console.error("Error processing individual change:", changeErr);
            }
          }

          if (mapChanged) {
            shouldAutoScrollRef.current = true;
            setMessages(sortMessagesAsc(Array.from(messagesMapRef.current.values())));
          }
        },
        (error) => {
          console.error("onSnapshot error:", error);
        }
      );
    } catch (e) {
      console.error("Failed to set up onSnapshot:", e);
    }

    return () => {
      console.log("Cleaning up onSnapshot listener");
      if (unsubscribe) unsubscribe();
    };
  }, [user, chatRoomId, myId]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    const t = setTimeout(() => {
      try {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } catch (e) {
      }
      shouldAutoScrollRef.current = false;
    }, 50);
    return () => clearTimeout(t);
  }, [messages]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (e) {
      console.log("Picker error:", e);
    }
  };

  const handleImageUpload = async (uri) => {
    if (!uri) return;
    setIsUploading(true);
    try {
      const cloudinaryUrl = await uploadImage(uri);

      if (cloudinaryUrl) {
        await sendMessageToFirestore(null, cloudinaryUrl);
      } else {
        Alert.alert("Error", "Cloudinary upload failed (no URL returned).");
      }

    } catch (error) {
      console.error("Upload failed details:", error);
      Alert.alert("Error", "Failed to send image.");
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessageToFirestore = async (txt, imgUrl = null) => {
    try {
      const messagesRef = collection(db, "chats", chatRoomId, "messages");

      const msgData = {
        senderId: myId,
        createdAt: serverTimestamp(),
      };
      if (txt) msgData.text = txt;
      if (imgUrl) msgData.image = imgUrl;

      const docRef = await addDoc(messagesRef, msgData);

      const roomRef = doc(db, "chats", chatRoomId);
      await setDoc(roomRef, {
        lastMessage: txt ? txt : (imgUrl ? "📷 Photo" : ""),
        lastMessageTimestamp: serverTimestamp(),
        participants: [myId, chatRoomId.replace(myId, "").replace("_", "")]
      }, { merge: true });

      shouldAutoScrollRef.current = true;
      setMessages(sortMessagesAsc([...messagesMapRef.current.values()]));
    } catch (error) {
      console.error("[ERROR] COULD NOT SEND IMAGE:", error);
      Alert.alert("Error", "Failed to send image.");
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !chatRoomId) return;

    const nowMs = Date.now();
    const trimmedMessage = message.trim();

    const localMessage = {
      id: `local_${nowMs}`,
      text: trimmedMessage,
      senderId: myId,
      createdAt: { toMillis: () => nowMs },
      clientCreatedAt: nowMs,
      status: "pending",
    };

    messagesMapRef.current.set(localMessage.id, localMessage);
    pendingLocalByClientCreatedAt.current.set(nowMs, localMessage.id);
    shouldAutoScrollRef.current = true;
    setMessages(sortMessagesAsc([...messagesMapRef.current.values()]));
    setMessage("");

    outgoingQueueRef.current.push({ localMessage, clientCreatedAt: nowMs });

    processQueue();
  };

  const processQueue = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;

    while (outgoingQueueRef.current.length > 0) {
      const { localMessage, clientCreatedAt } = outgoingQueueRef.current[0];

      try {
        const recipientId = params.contactId;
        if (!recipientId) throw new Error("No recipient");

        const userDoc = await getDoc(doc(db, "users", recipientId));
        if (!userDoc.exists() || !userDoc.data().publicKey) throw new Error("Recipient key missing");
        const recipientPublicKeyPem = userDoc.data().publicKey;

        const myUserDoc = await getDoc(doc(db, "users", myId));
        let myPublicKeyPem = myUserDoc.exists() ? myUserDoc.data().publicKey : null;
        if (!myPublicKeyPem) {
          try {
            const localPrivate = await getPrivateKey(myId);
            if (!localPrivate) {
              const gen = await runBackgroundKeygen(myId, { allowFallback: true });
              if (!gen || !gen.success) throw new Error("no-keys");
              await savePrivateKey(myId, gen.privateKeyPem);
              myPublicKeyPem = gen.publicKeyPem;
              await setDoc(doc(db, "users", myId), { publicKey: myPublicKeyPem }, { merge: true });
            } else {
              const gen = await runBackgroundKeygen(myId, { allowFallback: true });
              if (gen && gen.success) {
                await savePrivateKey(myId, gen.privateKeyPem);
                myPublicKeyPem = gen.publicKeyPem;
                await setDoc(doc(db, "users", myId), { publicKey: myPublicKeyPem }, { merge: true });
              } else {
                throw new Error("no-keys");
              }
            }
          } catch (e) {
            throw new Error("Sender key missing");
          }
        }

        const aesKeyWordArray = CryptoJS.lib.WordArray.random(32);
        const { ciphertext, iv } = aesEncryptToBase64(localMessage.text, aesKeyWordArray);
        const aesKeyBase64 = CryptoJS.enc.Base64.stringify(aesKeyWordArray);

        const encryptedForRecipient = await rsaEncryptBase64(aesKeyBase64, recipientPublicKeyPem);
        const encryptedForMe = await rsaEncryptBase64(aesKeyBase64, myPublicKeyPem);

        const messagesRef = collection(db, "chats", chatRoomId, "messages");

        const payload = {
          ciphertext,
          encryptedKeys: { [myId]: encryptedForMe, [recipientId]: encryptedForRecipient },
          iv,
          algorithm: "AES-CBC-256",
          senderId: myId,
          createdAt: serverTimestamp(),
          clientCreatedAt,
        };

        const docRef = await addDoc(messagesRef, payload);

        try {
          await saveDecryptedMessage({
            chatRoomId,
            messageId: docRef.id,
            plaintext: localMessage.text,
            ciphertext,
            iv,
            createdAtMs: clientCreatedAt,
            userId: myId,
            senderId: myId,
          });
        } catch (e) {
          console.warn("Failed to save server doc to cache in processQueue:", e);
        }

        messagesMapRef.current.set(localMessage.id, { ...localMessage, status: "sent" });

      } catch (err) {
        console.error("Failed to send queued message:", err);
        messagesMapRef.current.set(localMessage.id, { ...localMessage, status: "failed" });
      }

      outgoingQueueRef.current.shift();
      shouldAutoScrollRef.current = true;
      setMessages(sortMessagesAsc([...messagesMapRef.current.values()]));
    }

    sendingRef.current = false;
  };

  const handleSendText = () => {
    handleSend();
  };

  const formatTime = (timestampOrNormalized) => {
    if (!timestampOrNormalized) return "..."; 
    if (timestampOrNormalized.toDate && typeof timestampOrNormalized.toDate === "function") {
      return new Date(timestampOrNormalized.toDate()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (timestampOrNormalized.toMillis && typeof timestampOrNormalized.toMillis === "function") {
      return new Date(timestampOrNormalized.toMillis()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (typeof timestampOrNormalized === "number") {
      return new Date(timestampOrNormalized).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "...";
  };

  const getDateLabel = (timestamp) => {
    if (!timestamp) return "Today";

    let date;
    try {
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else if (timestamp.toMillis && typeof timestamp.toMillis === "function") {
        date = new Date(timestamp.toMillis());
      } else if (typeof timestamp === "number") {
        date = new Date(timestamp);
      } else if (timestamp && typeof timestamp === "object" && timestamp.clientCreatedAt) {
        date = new Date(Number(timestamp.clientCreatedAt));
      } else {
        return "Today";
      }
    } catch (e) {
      return "Today";
    }

    const now = new Date();
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = todayWithoutTime - dateWithoutTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const displayedMessages = isSearchActive
    ? messages.filter(m => m.text && m.text.toLowerCase().includes(searchText.toLowerCase()))
    : messages;

  const chatImages = messages
    .filter((msg) => msg.image)
    .map((msg) => ({ uri: msg.image }));

  const openImageGallery = (imageUrl) => {
    const index = chatImages.findIndex((img) => img.uri === imageUrl);
    if (index >= 0) {
      setCurrentImageIndex(index);
      setIsViewerVisible(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isSearchActive ? (
            <>
              <View style={styles.leftHeaderSection}>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                  <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.leftHeaderSection}
                  onPress={() => router.push({
                    pathname: "/chat/callerProfile", params: {
                      roomId: chatRoomId, name: otherUserProfile?.username || contactName,
                      image: otherUserProfile?.profileImage || contactImage,
                      username: otherUserProfile?.username,
                      nickname: otherUserProfile?.nickname, 
                    }
                  })}
                >
                  {contactImage ? (
                    <Image source={{ uri: contactImage }} style={styles.profileImg} />
                  ) : (
                    <View style={[styles.profileImg, { justifyContent: "center", alignItems: "center" }]}>
                      <Text style={styles.avatarText}>{contactName?.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={styles.title}>{otherUserProfile?.nickname || otherUserProfile?.username}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.button}>
                  <CallIcon width={28} height={28} fill={colors.iconFill} stroke={colors.iconStroke} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.searchHeader}>
              <SearchIcon width={20} height={20} color={colors.placeholder} opacity={0.7}/>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search messages"
                placeholderTextColor={colors.placeholder}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchText(""); }}>
                <CloseIcon width={24} height={24} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Chat messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScreen}
          contentContainerStyle={{ paddingBottom: 80 }}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          {displayedMessages.map((msg, index) => {
            const isOwn = msg.senderId === myId;
            const isFirstInGroup = index === 0 || displayedMessages[index - 1].senderId !== msg.senderId;

            if (!msg.id.startsWith("local_") && msg.clientCreatedAt != null) {
              const hasLocalVersion = messages.some(
                m => m.id.startsWith("local_") && m.clientCreatedAt === msg.clientCreatedAt
              );
              if (hasLocalVersion) {
                console.log("Skipping server duplicate:", msg.id, "local version exists");
                return null;
              }
            }

            const currentDateLabel = msg.createdAt ? getDateLabel(msg.createdAt) : null;
            const prevDateLabel = index > 0 && displayedMessages[index - 1].createdAt ? getDateLabel(displayedMessages[index - 1].createdAt) : null;
            const showDateHeader = currentDateLabel && currentDateLabel !== prevDateLabel;

            console.log("Rendering message ID:", msg.id, "Text:", msg.text, "clientCreatedAt:", msg.clientCreatedAt);

            return (
              <View key={msg.id}>
                {showDateHeader && (
                  <View style={styles.dateHeaderContainer}>
                    <Text style={styles.dateHeaderText}>{currentDateLabel}</Text>
                  </View>
                )}

                <View style={{ marginTop: (showDateHeader && isFirstInGroup) ? -15 : 0 }}>
                  <MessageBubble
                    text={msg.text}
                    image={msg.image}
                    time={formatTime(msg.createdAt)}
                    isOwnMessage={isOwn}
                    isFirstInGroup={isFirstInGroup}
                    onImagePress={() => msg.image && openImageGallery(msg.image)}
                  />
                </View>
              </View>
            );
          })}
          {isUploading && (
            <View style={{ alignSelf: 'flex-end', margin: 10, marginRight: 20 }}>
              <ActivityIndicator color={colors.button} />
              <Text style={{ color: colors.placeholder, fontSize: 10 }}>Sending photo...</Text>
            </View>
          )}
        </ScrollView>

        {!isSearchActive && (
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <AttachmentIcon width={22} height={22} color={colors.iconFill} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Message"
              placeholderTextColor={colors.placeholder}
            />
            <TouchableOpacity onPress={handleSendText} style={styles.button}>
              <SendIcon width={26} height={26} fill="#007bff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      <ImageViewing
        images={chatImages}
        imageIndex={currentImageIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        FooterComponent={({ imageIndex }) => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#FFF", fontSize: 16 }}>
              {imageIndex + 1} / {chatImages.length}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    chatScreen: {
      flex: 1,
      backgroundColor: colors.chatBackground,
      paddingHorizontal: 10,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      marginHorizontal: 14,
      marginTop: 10,
    },
    searchHeader: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      padding: 10,
      marginHorizontal: 8,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: colors.text,
    },
    title: {
      fontSize: 18,
      marginLeft: 5,
      fontWeight: "bold",
      color: colors.title,
      textAlign: "left",
    },
    profileImg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.button,
      marginRight: 10,
      marginLeft: 5,
    },
    avatarText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },
    addButton: {
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 10,
      paddingHorizontal: 10,
    },
    input: {
      padding: 8,
      flex: 1,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      marginHorizontal: 5,
    },
    button: {
      padding: 8,
    },
    leftHeaderSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    dateHeaderContainer: {
      alignItems: "center",
      marginVertical: 10,
      marginBottom: 5,
    },
    dateHeaderText: {
      color: colors.placeholder,
      fontSize: 12,
      fontWeight: "600",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: "hidden",
      opacity: 0.6,
    },
  });

export default ChatScreen;