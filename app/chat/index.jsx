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
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.button}>
          <BackIcon width={35} height={25} fill={"#fff"} />
        </TouchableOpacity>
        <View style={styles.profileImg} />
        <Text style={styles.title}>Tom Black</Text>
        <TouchableOpacity style={styles.button}>
          <CallIcon width={32} height={32} fill={"#fff"} stroke={"#fff"} />
        </TouchableOpacity>
      </View>

      {/* Chat messages */}
      <ScrollView style={styles.chatScreen}>
        <MessageBubble text="Hey where are you?" time="11:40" isOwnMessage={false} />
        <MessageBubble text="I am still waiting for you!" time="10:40" isOwnMessage={false} isFirstInGroup={false} />
        <MessageBubble text="Hey I am here" time="10:41" isOwnMessage={true} isFirstInGroup={true} />
        <MessageBubble text="Where are you, I can’t find you. Are you on the move right now?" time="10:45" isOwnMessage={true} isFirstInGroup={false} />
        <MessageBubble image="https://placehold.co/182x289" time="10:45" isOwnMessage={false} isFirstInGroup={true} />
        <MessageBubble text="Hey where are you?" time="11:40" isOwnMessage={false} />
        <MessageBubble text="I am still waiting for you!" time="10:40" isOwnMessage={false} isFirstInGroup={false} />
        <MessageBubble text="Hey I am here" time="10:41" isOwnMessage={true} isFirstInGroup={true} />
        <MessageBubble text="Where are you, I can’t find you. Are you on the move right now?" time="10:45" isOwnMessage={true} isFirstInGroup={false} />
        <MessageBubble image="https://placehold.co/182x289" time="10:45" isOwnMessage={false} isFirstInGroup={true} />
        <MessageBubble text="Hey where are you?" time="11:40" isOwnMessage={false} isFirstInGroup={false}/>
        <MessageBubble text="I am still waiting for you!" time="10:40" isOwnMessage={false} isFirstInGroup={false} />
        <MessageBubble text="Hey I am here" time="10:41" isOwnMessage={true} isFirstInGroup={true} />
        <MessageBubble text="Where are you, I can’t find you. Are you on the move right now?" time="10:45" isOwnMessage={true} isFirstInGroup={false} />
        <MessageBubble image="https://placehold.co/182x289" time="10:45" isOwnMessage={false} isFirstInGroup={true} />
        
      </ScrollView>

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleSend} style={styles.button}>
          <AttachmentIcon width={22} height={22} fill="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          backgroundColor = "#383D42"
          height={32}
        />
        <TouchableOpacity onPress={handleSend} style={styles.button}>
          <SendIcon width={26} height={26} fill="#007bff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
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
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e1f21",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  button: {
    padding: 8,
  },
});

export default ChatScreen;
