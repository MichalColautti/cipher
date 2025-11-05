import MessageBubble from "@/components/messageBubble";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import SendIcon from "../../assets/icons/send.svg";

const ChatScreen = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");

  // State to hold messages from database
  const [messages, setMessages] = useState([]);
  // Scrollview ref, in order to scroll downwards automatically
  const scrollViewRef = useRef(null);

  // -----------------------------------------------------------------
  // TODO
  // -----------------------------------------------------------------
  // Figure a way to pass chat room ID (or friend ID) from list screen
  // (app/index.jsx) to this screen. As for now, "test_test" is
  // hardcoded. Ultimately, we will probably implement
  // useLocalSearchParams from Expo Router and create chat room id
  // from two users IDs.

  const chatRoomId = "test_test";
  // -----------------------------------------------------------------

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  // REAL TIME MESSAGE LISTENING
  useEffect(() => {
    if (!user || !chatRoomId) return; // If user or chat room missing - do not listen

    // Create a reference to 'messages' collection inside our chat room
    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    // Create a query, in order to sort by date - from the latest message
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    // Listener - launches itself every time something changes in database
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      // Input downloaded messages into state
      setMessages(msgs);
    });

    // Clear listener whenever user leaves chat (to prevent leaks)
    return () => unsubscribe();
  }, [user, chatRoomId]); // Launch it, as soon as we obtain user and chat room id

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

  // MESSAGE SENDING
  const handleSend = async () => {
    if (message.trim()) {
      try {
        // The same reference as in the listener
        const messagesRef = collection(db, "chats", chatRoomId, "messages");

        // Add new document (message) to Firestore
        await addDoc(messagesRef, {
          text: message.trim(),
          senderId: user.id, // Logged user id form AuthContext
          createdAt: serverTimestamp(), // Timestamp from the server
        });

        setMessage(""); // Clear input

        // Scroll to the bottom
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error("[ERROR] COULD NOT SEND THE MESSAGE:", error);
        Alert.alert("Błąd", "Nie udało się wysłać wiadomości.");
      }
    }
  };

  // TIMESTAMP PARSING (DATABASE TIMESTAMP IS AN OBJECT)
  const formatTime = (timestamp) => {
    if (!timestamp) return "..."; // If the server has not confirmed yet
    return new Date(timestamp.toDate()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212427" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.button}>
            <BackIcon width={35} height={25} fill={"#fff"} />
          </TouchableOpacity>
          <View style={styles.profileImg} />
          <Text style={styles.title}>Tom Black</Text>
          <TouchableOpacity style={styles.button}>
            <CallIcon width={28} height={28} fill={"#fff"} stroke={"#fff"} />
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
            const isOwn = msg.senderId === user.id;

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
            <AttachmentIcon width={22} height={22} fill="#fff" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity onPress={handleSend} style={styles.button}>
            <SendIcon width={26} height={26} fill="#007bff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212427",
  },
  chatScreen: {
    flex: 1,
    backgroundColor: "#131416",
    paddingHorizontal: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "left",
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007bff",
    marginRight: 10,
    marginLeft: 5,
  },
  addButton: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e1f21",
    color: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    padding: 8,
  },
});

export default ChatScreen;
