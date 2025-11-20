import { useTheme } from "@/contexts/themeContext";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ChatItem = ({ name, message, time, imageUri, onPress }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.profileImg} />
      ) : (
        <View
          style={[
            styles.profileImg,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase()}</Text>
        </View>
      )}
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
    avatarText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 24,
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
