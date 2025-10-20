import { StyleSheet, Text, View } from "react-native";

const chatItem = () => (
  <View style={styles.container}>
    <View style={styles.profileImg} />
    <View style={styles.chatText}>
      <Text style={styles.chatName}>Name</Text>
      <Text style={styles.chatMessage} numberOfLines={2} ellipsizeMode="tail">test message: hello Michael this is me Andrew. How are you doing?</Text>
    </View>
    <Text style={styles.chatTime}>17:20</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "start",
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

export default chatItem;
