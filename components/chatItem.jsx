import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ChatItem = ({ name, message, time, targetScreen }) => {
  const router = useRouter();

  const handlePress = () => {
    if (targetScreen) {
      router.push(targetScreen);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  profileImg: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#007bff",
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
    color: "#fff",
    marginBottom: 3,
  },
  chatMessage: {
    fontSize: 15,
    color: "#bbb",
  },
  chatTime: {
    color: "#9e9e9e",
    fontSize: 13,
    minWidth: 46,
    textAlign: "right",
    marginLeft: 6,
  },
});

export default ChatItem;
