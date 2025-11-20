import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ChatItem = ({ name, message, time, friendId }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const makeChatRoomId = (idA, idB) =>
    [String(idA), String(idB)].sort().join("_");

  const handlePress = () => {
    if (!friendId) {
      console.warn("ChatItem: missing friendId");
      return;
    }

    const myId = user?.id ?? user?.uid;
    if (!myId) {
      console.warn("ChatItem: no logged user");
      return;
    }

    const roomId = makeChatRoomId(myId, friendId);

    router.push({
      pathname: "/chat",
      params: { roomId, friendId, contactName: name },
    });

  };

  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.profileImg} />
      <View style={styles.chatText}>
        <Text style={styles.chatName}>{name}</Text>
        <Text style={styles.chatMessage} numberOfLines={2} ellipsizeMode="tail">
          {message}
        </Text>
      </View>
      <Text style={styles.chatTime}>{time}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 18,
    },
    profileImg: {
      width: 55,
      height: 55,
      borderRadius: 27.5,
      backgroundColor: colors.button,
      marginRight: 12,
    },
    chatText: {
      flex: 1,
      marginRight: 8,
      maxHeight: 50,
    },
    chatName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 3,
    },
    chatMessage: {
      fontSize: 15,
      color: colors.placeholder,
    },
    chatTime: {
      color: colors.placeholder,
      fontSize: 13,
      minWidth: 46,
      textAlign: "right",
      marginLeft: 6,
    },
  });

export default ChatItem;
