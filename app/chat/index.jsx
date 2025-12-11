import MessageBubble from "@/components/messageBubble";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { uploadImage } from "@/services/imageService";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AttachmentIcon from "../../assets/icons/attachment.svg";
import BackIcon from "../../assets/icons/back.svg";
import CallIcon from "../../assets/icons/call.svg";
import CloseIcon from "../../assets/icons/close.svg";
import SearchIcon from "../../assets/icons/search.svg";
import SendIcon from "../../assets/icons/send.svg";

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const scrollViewRef = useRef(null);
  
  const triggerSearch = params.triggerSearch;
  const chatRoomId = params.roomId ? String(params.roomId) : null;
  const contactName = params.contactName ? String(params.contactName) : null;
  const contactImage = params.contactImage ? String(params.contactImage) : null;
  const myId = user?.id ?? user?.uid;

  // -----------------------------------------------------------------

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (triggerSearch === 'true') {
      setIsSearchActive(true);
    }
  }, [triggerSearch]);

  // REAL TIME MESSAGE LISTENING
  useEffect(() => {
    if (!user || !chatRoomId) return;

    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, chatRoomId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!user) return null;

  // Image picker
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        // Call helper function
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
      // Send to cloudinary
      const cloudinaryUrl = await uploadImage(uri);

      if (cloudinaryUrl) {
        // Send message with URL
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

  // Universal send fuction
  const sendMessageToFirestore = async (txt, imgUrl = null) => {
    try {
      const messagesRef = collection(db, "chats", chatRoomId, "messages");

      // Build message object
      const msgData = {
        senderId: myId,
        createdAt: serverTimestamp(),
      };
      if (txt) msgData.text = txt;
      if (imgUrl) msgData.image = imgUrl; // Photo URL if exists

      // Save message in history
      await addDoc(messagesRef, msgData);

      // Update chatroom cover
      const roomRef = doc(db, "chats", chatRoomId);
      await setDoc(roomRef, {
        lastMessage: txt ? txt : "📷 Photo", // If last message is a photo, use an icon
        lastMessageTimestamp: serverTimestamp(),
        participants: [myId, chatRoomId.replace(myId, "").replace("_", "")]
      }, { merge: true });

      setMessage(""); // Clear input
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error("[ERROR] COULD NOT SEND:", error);
      Alert.alert("Błąd", "Nie udało się wysłać wiadomości.");
    }
  };

  // Handle send button (for text messages)
  const handleSendText = () => {
    if (message.trim()) {
      sendMessageToFirestore(message.trim(), null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "...";
    return new Date(timestamp.toDate()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtering (local search)
  const displayedMessages = isSearchActive
    ? messages.filter(m => m.text && m.text.toLowerCase().includes(searchText.toLowerCase()))
    : messages;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isSearchActive ? (
            // Normal header
            <>
              <View style={styles.leftHeaderSection}>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                  <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.leftHeaderSection}
                  onPress={() => router.push({ pathname: "/chat/callerProfile", params: { roomId: chatRoomId, name: contactName, image: contactImage } })}
                >
                  {contactImage ? (
                    <Image source={{ uri: contactImage }} style={styles.profileImg} />
                  ) : (
                    <View style={[styles.profileImg, { justifyContent: "center", alignItems: "center" }]}>
                      <Text style={styles.avatarText}>{contactName?.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={styles.title}>{contactName}</Text>
                </TouchableOpacity>
              </View>

              {/* Right header section */}
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.button}>
                  <CallIcon width={28} height={28} fill={colors.iconFill} stroke={colors.iconStroke} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Search header, hidden by default
            <View style={styles.searchHeader}>
              <SearchIcon width={20} height={20} color={colors.placeholder} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search..."
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
          onContentSizeChange={() => !isSearchActive && scrollViewRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {displayedMessages.map((msg, index) => {
            const isOwn = msg.senderId === myId;
            const isFirstInGroup = index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <MessageBubble
                key={msg.id}
                text={msg.text}
                image={msg.image}
                time={formatTime(msg.createdAt)}
                isOwnMessage={isOwn}
                isFirstInGroup={isFirstInGroup}
              />
            );
          })}
          {/* Spinner while photo is uploading */}
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
              placeholderTextColor={colors.placeholder}
            />
            <TouchableOpacity onPress={handleSendText} style={styles.button}>
              <SendIcon width={26} height={26} fill="#007bff" />
            </TouchableOpacity>
          </View>
        )}
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
    searchHeader: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      paddingHorizontal: 10,
      height: 40,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
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