import MessageBubble from "@/components/messageBubble";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

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

  const handleSend = () => {
    if (message.trim()) {
      console.log("Send:", message);
      setMessage("");
    }
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
          <View style={styles.leftHeaderSection}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <BackIcon width={35} height={25} fill={"#fff"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.leftHeaderSection} onPress={() => router.push("/chat/callerProfile")}>
              <View style={styles.profileImg} />
              <Text style={styles.title}>Tom Black</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button}>
            <CallIcon width={28} height={28} fill={"#fff"} stroke={"#fff"} />
          </TouchableOpacity>
        </View>

        {/* Chat messages */}
        <ScrollView
          style={styles.chatScreen}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <MessageBubble
            text="Hey where are you?"
            time="11:40"
            isOwnMessage={false}
          />
          <MessageBubble
            text="I am still waiting for you!"
            time="10:40"
            isOwnMessage={false}
            isFirstInGroup={false}
          />
          <MessageBubble
            text="Hey I am here"
            time="10:41"
            isOwnMessage={true}
            isFirstInGroup={true}
          />
          <MessageBubble
            text="Where are you, I can’t find you. Are you on the move right now?"
            time="10:45"
            isOwnMessage={true}
            isFirstInGroup={false}
          />
          <MessageBubble
            image="https://placehold.co/182x289"
            time="10:45"
            isOwnMessage={false}
            isFirstInGroup={true}
          />
          <MessageBubble
            text="Hey where are you?"
            time="11:40"
            isOwnMessage={false}
          />
          <MessageBubble
            text="I am still waiting for you!"
            time="10:40"
            isOwnMessage={false}
            isFirstInGroup={false}
          />
          <MessageBubble
            text="Hey I am here"
            time="10:41"
            isOwnMessage={true}
            isFirstInGroup={true}
          />
          <MessageBubble
            text="Where are you, I can’t find you. Are you on the move right now?"
            time="10:45"
            isOwnMessage={true}
            isFirstInGroup={false}
          />
          <MessageBubble
            image="https://placehold.co/182x289"
            time="10:45"
            isOwnMessage={false}
            isFirstInGroup={true}
          />
          <MessageBubble
            text="Hey where are you?"
            time="11:40"
            isOwnMessage={false}
            isFirstInGroup={false}
          />
          <MessageBubble
            text="I am still waiting for you!"
            time="10:40"
            isOwnMessage={false}
            isFirstInGroup={false}
          />
          <MessageBubble
            text="Hey I am here"
            time="10:41"
            isOwnMessage={true}
            isFirstInGroup={true}
          />
          <MessageBubble
            text="Where are you, I can’t find you. Are you on the move right now?"
            time="10:45"
            isOwnMessage={true}
            isFirstInGroup={false}
          />
          <MessageBubble
            image="https://placehold.co/182x289"
            time="10:45"
            isOwnMessage={false}
            isFirstInGroup={true}
          />
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
    marginTop: 10,
  },
  title: {
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
    padding: 8,
    flex: 1,
    backgroundColor: "#383D42",
    color: "#fff",
    borderRadius: 20,
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
