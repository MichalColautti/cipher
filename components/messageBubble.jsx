import { Image, StyleSheet, Text, View } from "react-native";

const MessageBubble = ({ 
  text, 
  image, 
  time, 
  isOwnMessage = false,
  isFirstInGroup = true
}) => {
  const bubbleShape = isOwnMessage
    ? isFirstInGroup
      ? styles.rightShapeFirst
      : styles.rightShapeNext
    : isFirstInGroup
      ? styles.leftShapeFirst
      : styles.leftShapeNext;

  const bubbleStyle = isOwnMessage
    ? styles.rightBubble
    : styles.leftBubble;

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      <View
        style={[
          styles.bubbleRow,
          isOwnMessage ? styles.bubbleRowRight : styles.bubbleRowLeft,
        ]}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={[
              styles.image,
              bubbleShape,
            ]}
          />
        ) : (
          <View style={[bubbleStyle, bubbleShape]}>
            <Text
              style={[
                styles.text,
                isOwnMessage ? styles.rightText : styles.leftText,
              ]}
            >
              {text}
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.time,
            isOwnMessage ? styles.rightTime : styles.leftTime,
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "75%",
  },

  leftContainer: {
    alignSelf: "flex-start",
  },
  rightContainer: {
    alignSelf: "flex-end",
  },

  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  bubbleRowLeft: {
    flexDirection: "row",
  },
  bubbleRowRight: {
    flexDirection: "row-reverse",
  },

  text: {
    fontSize: 16,
  },
  rightText: {
    color: "#fff",
  },
  leftText: {
    color: "#000",
  },

  time: {
    fontSize: 12,
    marginHorizontal: 6,
    opacity: 0.6,
  },
  rightTime: {
    color: "#ddd",
  },
  leftTime: {
    color: "#999",
  },

  image: {
    width: 220,
    height: 220,
    resizeMode: "cover",
    marginHorizontal: 10,
  },

  rightBubble: {
    backgroundColor: "#648BCE",
    padding: 10,
    marginRight: 10,
  },
  leftBubble: {
    backgroundColor: "#F9F6F0",
    padding: 10,
    marginLeft: 10,
  },

  rightShapeFirst: {
    borderTopLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  rightShapeNext: {
    borderRadius: 5,
  },
  leftShapeFirst: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  leftShapeNext: {
    borderRadius: 5,
  },
});

export default MessageBubble;
