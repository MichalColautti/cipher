import ChatItem from "@/components/chatItem";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { getMyFriends } from "@/services/userService";
import { db } from "@/config/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddChatIcon from "../assets/icons/addChat.svg";
import SearchIcon from "../assets/icons/search.svg";

const HomeScreen = () => {
  const { user, loading, logout } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [friends, setFriends] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // Fetch friends whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadFriends = async () => {
        if (!user) return;
        try {
          const myFriends = await getMyFriends(user.id || user.uid);
          setFriends(myFriends);
        } catch (error) {
          console.error("Błąd pobierania znajomych na ekranie głównym:", error);
        }
      };
      loadFriends();
    }, [user])
  );

  const getChatRoomId = (user1, user2) => {
    const sortedIds = [user1, user2].sort();
    return sortedIds.join("_");
  };

  const openChat = (otherUser) => {
    const myId = user.id || user.uid;
    const roomId = getChatRoomId(myId, otherUser.id);

    const displayName = otherUser.nickname || otherUser.username;

    router.push({
      pathname: "/chat",
      params: {
        roomId,
        contactId: otherUser.id,
        contactName: displayName,
        contactImage: otherUser.profileImage,
        username: otherUser.username,
        nickname: otherUser.nickname,
      },
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : user ? (
        <View style={styles.chatScreen}>
          {/* header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                router.push("/profile");
              }}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
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
                    {user?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.title}>Cipher</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/newChat")}
            >
              <AddChatIcon width={25} height={25} color={colors.iconStroke} />
            </TouchableOpacity>
          </View>

          {/* search bar */}
          <View style={styles.searchContainer}>
            <SearchIcon
              width={20}
              height={20}
              color={colors.iconFill}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search contacts"
              placeholderTextColor={colors.placeholder}
              style={styles.searchBar}
            />
          </View>

          {/* chat list */}
          <ScrollView>
            <Text style={styles.subtitle}>Chats</Text>
              {friends.length === 0 && (
                <Text style={{ color: colors.placeholder, textAlign: 'center', marginTop: 20 }}>
                  No chats yet. Click + to start.
                </Text>
              )}
              {friends.map((friend) => (
                <LiveChatItem
                  key={friend.id}
                  friend={friend}
                  currentUser={user}
                  onPress={() => openChat(friend)}
                  getChatRoomId={getChatRoomId}
                />
              ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const LiveChatItem = ({ friend, currentUser, onPress, getChatRoomId }) => {
  const [lastMsg, setLastMsg] = useState("Tap to start conversation");
  const [time, setTime] = useState("");

  useEffect(() => {
    const myId = currentUser.id || currentUser.uid;
    const roomId = getChatRoomId(myId, friend.id);
    const roomRef = doc(db, "chats", roomId);

    // Listen for real-time updates in the chat room document
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastMessage) {
          setLastMsg(data.lastMessage);
        }
        if (data.lastMessageTimestamp) {
          // Fast formatting of timestamp
          const date = data.lastMessageTimestamp.toDate();
          const now = new Date();
          // If today, show time, else show date
          if (date.toDateString() === now.toDateString()) {
            setTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          } else {
            setTime(date.toLocaleDateString());
          }
        }
      }
    });

    return () => unsubscribe();
  }, [friend, currentUser]);

  return (
    <ChatItem
      name={friend.nickname || friend.username}
      message={lastMsg}
      time={time}
      imageUri={friend.profileImage}
      onPress={onPress}
    />
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    chatScreen: {
      marginHorizontal: 10,
      flex: 1,
    },
    header: {
      alignItems: "center",
      marginTop: 30,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "bold",
      color: colors.title,
      textAlign: "center",
    },
    profileImg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.button,
    },
    avatarText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },
    addButton: {
      color: colors.text,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      padding: 10,
      marginTop: 20,
      borderRadius: 8,
      marginBottom: 20,
    },
    searchBar: {
      marginLeft: 10,
      color: colors.text,
      flex: 1,
    },
    searchIcon: {
      opacity: 0.7,
    },
    subtitle: {
      color: colors.text,
      fontSize: 20,
      marginBottom: 20,
      fontWeight: "600",
    },
  });

export default HomeScreen;
