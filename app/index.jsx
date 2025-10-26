import ChatItem from "@/components/chatItem";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
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
              <View style={styles.profileImg} />
            </TouchableOpacity>
            <Text style={styles.title}>Cipher</Text>
            <TouchableOpacity style={styles.addButton}>
              <AddChatIcon width={40} height={40} stroke={"#fff"} />
            </TouchableOpacity>
          </View>

          {/* search bar */}
          <View style={styles.searchContainer}>
            <SearchIcon
              width={20}
              height={20}
              color={"#fff"}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search"
              placeholderTextColor={"#F9F6F0"}
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
              targetScreen="/chat"
            />
            <ChatItem
              name="Julie 🤍"
              message="I'll be back at 5"
              time="47 min"
              targetScreen="/chat"
            />
            <Text style={styles.subtitle}>Chats</Text>
            <ChatItem
              name="Sheldon"
              message="Thanks mate."
              time="2 day"
              targetScreen="/chat"
            />
            <ChatItem
              name="Dad"
              message="👍"
              time="3 day"
              targetScreen="/chat"
            />
            <ChatItem
              name="James Leaf"
              message="The deadline for the project is now on Friday instead of next Monday, please confirm."
              time="5 day"
              targetScreen="/chat"
            />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212427",
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
    color: "#FFFFFF",
    textAlign: "center",
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007bff",
  },
  addButton: {
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#383D42",
    padding: 10,
    marginTop: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  searchBar: {
    marginLeft: 10,
    opacity: 0.5,
  },
  searchIcon: {
    opacity: 0.5,
  },
  subtitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "600",
  },
});

export default HomeScreen;
