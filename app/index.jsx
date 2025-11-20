import ChatItem from "@/components/chatItem";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
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

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

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
                <View style={styles.profileImg} />
              )}
            </TouchableOpacity>
            <Text style={styles.title}>Cipher</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/newChat")}
            >
              <AddChatIcon width={40} height={40} color={colors.iconStroke} />
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
              placeholder="Search"
              placeholderTextColor={colors.placeholder}
              style={styles.searchBar}
            />
          </View>

          {/* chat list */}
          <ScrollView>
            <Text style={styles.subtitle}>Pinned</Text>
            <ChatItem
              name="Tom Black"
              message="Where I can't find you"
              time="4 min"
              friendId="Tom Black"
            />
            <ChatItem
              name="Julie 🤍"
              message="I'll be back at 5"
              time="47 min"
              friendId="Julie"
            />
            <Text style={styles.subtitle}>Chats</Text>
            <ChatItem
              name="Sheldon"
              message="Thanks mate."
              time="2 day"
              friendId="Sheldon"
            />
            <ChatItem name="Dad" message="👍" time="3 day" friendId="Dad" />
            <ChatItem
              name="James Leaf"
              message="The deadline for the project is now on Friday instead of next Monday, please confirm."
              time="5 day"
              friendId="James Leaf"
            />
          </ScrollView>
        </View>
      ) : null}
    </View>
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
      fontSize: 32,
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
    addButton: {
      color: colors.text,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      padding: 10,
      marginTop: 20,
      borderRadius: 16,
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
