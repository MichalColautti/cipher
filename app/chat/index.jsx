import MessageBubble from "@/components/messageBubble";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import CryptoJS from "crypto-js";

import {
  aesDecryptFromBase64,
  aesEncryptToBase64,
  getPrivateKey,
  rsaDecryptBase64,
  rsaEncryptBase64,
} from "@/services/cryptoService";
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
  Platform,
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
  // rawMsgDoc: { id, ciphertext, iv, encryptedKeys, ... }
  try {
    if (!rawMsgDoc.encryptedKeys || !rawMsgDoc.ciphertext || !rawMsgDoc.iv) {
      return { ...rawMsgDoc, text: rawMsgDoc.text ?? null };
    }

    // If we already cached AES key for this message, use it
    const cached = aesKeyCacheMap.get(rawMsgDoc.id);
    let aesKeyBase64 = cached;

    if (!aesKeyBase64) {
      // pick encrypted key for this user
      const encryptedKeyForMe = rawMsgDoc.encryptedKeys[myId];
      if (!encryptedKeyForMe) return { ...rawMsgDoc, text: "(cannot decrypt)" };
      if (!privateKeyPem) return { ...rawMsgDoc, text: "(cannot decrypt)" };

      // RSA decrypt once, store in map
      aesKeyBase64 = await rsaDecryptBase64(encryptedKeyForMe, privateKeyPem);
      aesKeyCacheMap.set(rawMsgDoc.id, aesKeyBase64);
    }

    // AES decrypt the ciphertext
    const plaintext = aesDecryptFromBase64(rawMsgDoc.ciphertext, aesKeyBase64, rawMsgDoc.iv);
    return { ...rawMsgDoc, text: plaintext };
  } catch (err) {
    console.error("Failed to decrypt message:", err);
    return { ...rawMsgDoc, text: "(failed to decrypt)" };
  }
}

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const [message, setMessage] = useState("");

  // State to hold messages from database
  const [messages, setMessages] = useState([]);
  // Scrollview ref, in order to scroll downwards automatically
  const scrollViewRef = useRef(null);

  const chatRoomId = params.roomId ? String(params.roomId) : null;
  const contactName = params.contactName ? String(params.contactName) : null;
  const contactImage = params.contactImage ? String(params.contactImage) : null;
  const myId = user?.id ?? user?.uid;

  // --- helpers for time normalization & sorting ---
  const toMillisFromDoc = (docObj) => {
    if (!docObj) return Date.now();
    const ts = docObj.createdAt;
    // prefer server Timestamp
    if (ts && typeof ts.toMillis === "function") return ts.toMillis();
    // fallback to numeric clientCreatedAt
    if (typeof docObj.clientCreatedAt === "number") return docObj.clientCreatedAt;
    // fallback if createdAt stored as number/Date
    if (typeof ts === "number") return ts;
    if (ts && typeof ts.getTime === "function") return ts.getTime();
    return Date.now();
  };

  const sortMessagesAsc = (arr) =>
    arr.sort((a, b) => toMillisFromDoc(a) - toMillisFromDoc(b));

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  // REAL TIME MESSAGE LISTENING
  useEffect(() => {
    if (!user || !chatRoomId) return;

    // Refs for caches
    const privateKeyRef = { current: null }; // we will populate below
    const aesKeyCacheRef = { current: new Map() }; // messageId -> aesKeyBase64
    const messagesMapRef = { current: new Map() }; // messageId -> decrypted message object

    // load private key once
    (async () => {
      try {
        const pk = await getPrivateKey(myId);
        privateKeyRef.current = pk; // can be null if absent
      } catch (e) {
        console.warn("Could not load private key:", e);
      }
    })();

    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Process only changed docs
      const changes = querySnapshot.docChanges();
      let mapChanged = false;

      // iterate changes sequentially to keep cache consistent
      for (const change of changes) {
        const docSnap = change.doc;
        // Note: docSnap.data() might not contain server timestamp yet
        const data = docSnap.data();
        const raw = { id: docSnap.id, ...data };

        // normalize createdAt fallback: if missing, use clientCreatedAt or Date.now()
        if (!raw.createdAt) {
          // If there's a clientCreatedAt field, prefer that
          if (typeof raw.clientCreatedAt === "number") {
            raw.createdAt = { toMillis: () => raw.clientCreatedAt };
          } else {
            raw.createdAt = { toMillis: () => Date.now() };
          }
        }

        if (change.type === "removed") {
          if (messagesMapRef.current.has(raw.id)) {
            messagesMapRef.current.delete(raw.id);
            aesKeyCacheRef.current.delete(raw.id);
            mapChanged = true;
          }
          continue;
        }

        // 'added' or 'modified' -> decrypt only this doc
        const decrypted = await decryptSingleMessage(
          raw,
          myId,
          privateKeyRef.current,
          aesKeyCacheRef.current
        );

        // update map if changed (or added)
        const existing = messagesMapRef.current.get(raw.id);
        const hasChanged =
          !existing ||
          existing.text !== decrypted.text ||
          toMillisFromDoc(existing) !== toMillisFromDoc(raw);

        if (hasChanged) {
          // keep the original createdAt (Firestore timestamp or normalized fallback)
          messagesMapRef.current.set(raw.id, { ...decrypted, createdAt: raw.createdAt, clientCreatedAt: raw.clientCreatedAt });
          mapChanged = true;
        }
      }

      if (mapChanged) {
        // produce sorted array from map entries (ascending createdAt, with client fallback)
        const arr = sortMessagesAsc(Array.from(messagesMapRef.current.values()));
        setMessages(arr);
      }
    });

    return () => unsubscribe();
  }, [user, chatRoomId, myId]);

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

  // MESSAGE SENDING (now includes clientCreatedAt)
  const handleSend = async () => {
    if (!message.trim() || !chatRoomId) return;
    try {
      const recipientId = params.contactId;
      if (!recipientId) return;

      const userDoc = await getDoc(doc(db, "users", recipientId));
      if (!userDoc.exists() || !userDoc.data().publicKey) return;

      const recipientPublicKeyPem = userDoc.data().publicKey;

      const aesKeyWordArray = CryptoJS.lib.WordArray.random(32);
      const { ciphertext, iv } = aesEncryptToBase64(message.trim(), aesKeyWordArray);
      const aesKeyBase64 = CryptoJS.enc.Base64.stringify(aesKeyWordArray);
      // Encrypt AES key for recipient
      const encryptedForRecipient = await rsaEncryptBase64(aesKeyBase64, recipientPublicKeyPem);

      // Encrypt AES key for sender (yourself)
      const myUserDoc = await getDoc(doc(db, "users", myId));
      if (!myUserDoc.exists() || !myUserDoc.data().publicKey) return;
      const myPublicKeyPem = myUserDoc.data().publicKey;
      const encryptedForMe = await rsaEncryptBase64(aesKeyBase64, myPublicKeyPem);

      // Store both keys in Firestore
      const messagesRef = collection(db, "chats", chatRoomId, "messages");

      // client timestamp to avoid ordering glitches while server timestamp is pending
      const nowMs = Date.now();

      await addDoc(messagesRef, {
        ciphertext,
        encryptedKeys: {
          [myId]: encryptedForMe,
          [recipientId]: encryptedForRecipient
        },
        iv,
        algorithm: "AES-CBC-256",
        senderId: myId,
        createdAt: serverTimestamp(),
        clientCreatedAt: nowMs, // <<---- ADDED
      });

      setMessage("");
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("Encryption/send error:", err);
    }
  };

  // TIMESTAMP PARSING (DATABASE TIMESTAMP IS AN OBJECT or fallback)
  const formatTime = (timestampOrNormalized) => {
    if (!timestampOrNormalized) return "..."; // If the server has not confirmed yet
    // If it's a Firestore Timestamp object:
    if (timestampOrNormalized.toDate && typeof timestampOrNormalized.toDate === "function") {
      return new Date(timestampOrNormalized.toDate()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // If it's our normalized object with toMillis()
    if (timestampOrNormalized.toMillis && typeof timestampOrNormalized.toMillis === "function") {
      return new Date(timestampOrNormalized.toMillis()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // If a number
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
          // Scroll to the bottom whenever app loads up
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
          // Scroll to the bottom when user taps
          onLayout={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === myId;

            // Simple logic - Is the previous message from a different person?
            const isFirstInGroup =
              index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <MessageBubble
                key={msg.id}
                text={msg.text}
                // image={msg.image} // TODO: Add images handling
                time={formatTime(msg.createdAt)}
                isOwnMessage={isOwn}
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
