import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import GroupIcon from "@/assets/icons/group.svg";
import MailIcon from "@/assets/icons/mail.svg";
import SearchIcon from "@/assets/icons/search.svg";

import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { getMyFriends } from "@/services/userService";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getChatRoomId = (user1, user2) => {
  const sortedIds = [user1, user2].sort();
  return sortedIds.join("_");
};

const NewChatScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, colors } = useTheme();

  const styles = getStyles(colors, theme);

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Fetch friends whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadFriends = async () => {
        if (!user) return;
        setLoading(true);
        try {
          const myFriends = await getMyFriends(user.id || user.uid);
          setFriends(myFriends);
        } catch (error) {
          console.error("Błąd pobierania znajomych:", error);
        } finally {
          setLoading(false);
        }
      };
      loadFriends();
    }, [user])
  );

  // Open chat with selected user
  const openChat = (otherUser) => {
    const myId = user.id || user.uid;
    const roomId = getChatRoomId(myId, otherUser.id);

    const displayName = otherUser.nickname || otherUser.username;

    router.push({
      pathname: "/chat",
      params: {
        roomId: roomId,
        contactName: displayName,
        contactImage: otherUser.profileImage,
        username: otherUser.username,
        nickname: otherUser.nickname,
      },
    });
  };

  const handleAddByTag = () => {
    router.push({ pathname: "/contacts/", params: { method: "tag" } });
  };

  const handleAddByEmail = () => {
    router.push({ pathname: "/contacts/", params: { method: "email" } });
  };

  // Function to group and filter friends by search text
  const sections = useMemo(() => {
    // Helper to extract display name
    const getDisplayName = (u) => u.nickname || u.username;

    const filtered = friends.filter((u) => {
      const searchLower = searchText.toLowerCase();
      const displayLower = getDisplayName(u).toLowerCase();
      const usernameLower = u.username?.toLowerCase() || "";

      // Look in both DISPLAY NAME and USERNAME
      return displayLower.includes(searchLower) || usernameLower.includes(searchLower);
    });

    // Sort alphabetically by DISPLAY NAME
    const sorted = filtered.sort((a, b) =>
      getDisplayName(a).localeCompare(getDisplayName(b))
    );

    // Group by first letter of DISPLAY NAME
    const grouped = sorted.reduce((acc, user) => {
      const name = getDisplayName(user);
      const firstLetter = name.charAt(0).toUpperCase();

      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(user);
      return acc;
    }, {});

    return Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));
  }, [friends, searchText]);

  const renderUserItem = ({ item }) => {
    const displayName = item.nickname || item.username;

    return (
      <TouchableOpacity
        style={[styles.userItem, { backgroundColor: colors.settingsBackground }]}
        onPress={() => openChat(item)}
      >
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.button }]}>
            <Text style={styles.avatarText}>
              {displayName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[styles.userName, { color: colors.text }]}>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.title }]}>
          New message
        </Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.inputBackground },
        ]}
      >
        <SearchIcon
          width={20}
          height={20}
          color={colors.iconFill}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search contacts"
          placeholderTextColor={colors.placeholder}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Static options for buttons */}
      <View
        style={[
          styles.actionsContainer,
          { backgroundColor: colors.settingsBackground },
        ]}
      >
        <ActionItem
          label="New groupchat"
          IconComponent={GroupIcon}
          colors={colors}
          onPress={() => { }}
          styles={styles}
        />
        <ActionItem
          label="Add new contact by Cipher tag"
          IconComponent={AtIcon}
          colors={colors}
          onPress={handleAddByTag}
          styles={styles}
        />
        <ActionItem
          label="Add new contact by email"
          IconComponent={MailIcon}
          colors={colors}
          isLast={true}
          onPress={handleAddByEmail}
          styles={styles}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.button} style={{ marginTop: 20 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.letterHeader, { color: colors.placeholder }]}>
              {title}
            </Text>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text
              style={{
                color: colors.placeholder,
                textAlign: "center",
                marginTop: 20,
                paddingHorizontal: 40,
              }}
            >
              {
                'You don\'t have any contacts yet.\nUse "Add new contact" above to find people.'
              }
            </Text>
          }
        />
      )}
    </View>
  );
};

const ActionItem = ({
  label,
  IconComponent,
  colors,
  isLast,
  onPress,
  styles,
}) => (
  <>
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionIconPlaceholder}>
        <IconComponent width={22} height={22} color={colors.iconFill} />
      </View>
      <Text style={[styles.actionText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
    {!isLast && (
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
    )}
  </>
);

const getStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 22,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 30,
    },
    headerTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: "bold",
      color: colors.title,
      textAlign: "center",
    },
    backBtn: {
      padding: 5,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      padding: 10,
      borderRadius: 8,
      marginTop: 20,
      marginBottom: 20,
    },
    searchIcon: {
      opacity: 0.7,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: colors.text,
    },
    actionsContainer: {
      borderRadius: 8,
      marginBottom: 20,
      ...(theme === "light" && {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
      }),
    },
    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    divider: {
      height: 1,
      marginLeft: 54,
    },
    actionIconPlaceholder: {
      width: 22,
      height: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    actionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 0,
      marginBottom: 10,
    },
    letterHeader: {
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 5,
      marginTop: 10,
      marginBottom: 5,
    },
    userItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
      ...(theme === "light" && {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
      }),
      borderRadius: 8,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    avatarText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },
    userName: {
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default NewChatScreen;