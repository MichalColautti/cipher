import MessageBubble from "@/components/messageBubble";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import CryptoJS from "crypto-js";

import { Platform } from "react-native";

import {
  aesDecryptFromBase64,
  aesEncryptToBase64,
  getPrivateKey,
  rsaDecryptBase64,
  rsaEncryptBase64,
} from "@/services/cryptoService";
import { clearCachedMessage, loadAllCachedForChat, loadCachedDecryptedMessage, saveDecryptedMessage } from "@/services/messageCache";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc, getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
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
                  mapChanged = true;
                  continue;
                }
              }

              const decrypted = await getDecryptedOrCached(raw, myId, privateKeyRef.current, aesKeyCacheRef.current, chatRoomId);
              if (!decrypted.text) decrypted.text = "(cannot decrypt)";
              messagesMapRef.current.set(raw.id, { ...decrypted, createdAt: raw.createdAt });
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

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!user) return null;

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
        if (!myUserDoc.exists() || !myUserDoc.data().publicKey) throw new Error("Sender key missing");
        const myPublicKeyPem = myUserDoc.data().publicKey;

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leftHeaderSection}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <BackIcon
                width={35}
                height={25}
                color={colors.iconFill}
                fill={colors.iconFill}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leftHeaderSection}
              onPress={() =>
                router.push({
                  pathname: "/chat/callerProfile",
                  params: { name: contactName, image: contactImage },
                })
              }
            >
              {contactImage ? (
                <Image
                  source={{ uri: contactImage }}
                  style={styles.profileImg}
                />
              ) : (
                <View
                  style={[
                    styles.profileImg,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {contactName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.title}>{contactName}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button}>
            <CallIcon
              width={28}
              height={28}
              fill={colors.iconFill}
              stroke={colors.iconStroke}
            />
          </TouchableOpacity>
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
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === myId;
            const isFirstInGroup = index === 0 || messages[index - 1].senderId !== msg.senderId;

            if (!msg.id.startsWith("local_") && msg.clientCreatedAt != null) {
              const hasLocalVersion = messages.some(
                m => m.id.startsWith("local_") && m.clientCreatedAt === msg.clientCreatedAt
              );
              if (hasLocalVersion) {
                console.log("Skipping server duplicate:", msg.id, "local version exists");
                return null;
              }
            }

            console.log("Rendering message ID:", msg.id, "Text:", msg.text, "clientCreatedAt:", msg.clientCreatedAt);
            
            return (
              <MessageBubble
                key={msg.id}
                text={msg.text || "(loading...)"}
                time={formatTime(msg.createdAt)}
                isOwnMessage={msg.senderId === myId}
                isFirstInGroup={isFirstInGroup}
              />
            );
          })}
        </ScrollView>

        {/* Message input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.button}>
            <AttachmentIcon width={22} height={22} color={colors.iconFill} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={colors.placeholder}
          />
          <TouchableOpacity onPress={handleSend} style={styles.button}>
            <SendIcon width={26} height={26} fill="#007bff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
      backgroundColor: colors.background,
      paddingHorizontal: 10,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      marginHorizontal: 10,
      marginTop: 10,
    },
    title: {
      fontSize: 24,
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
    },
    button: {
      padding: 8,
    },
    leftHeaderSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default ChatScreen;
