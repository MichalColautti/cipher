import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import GroupIcon from "@/assets/icons/group.svg";
import MailIcon from "@/assets/icons/mail.svg";
import SearchIcon from "@/assets/icons/search.svg";

import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { getMyFriends } from "@/services/userService";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getChatRoomId = (user1, user2) => {
    const sortedIds = [user1, user2].sort();
    return sortedIds.join("_");
};

const NewChatScreen = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();

    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    // Load friends on mount
    useEffect(() => {
        const loadFriends = async () => {
            if (!user) return;
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
    }, [user]);

    // Open chat with selected user
    const openChat = (otherUser) => {
        const myId = user.id || user.uid;
        const roomId = getChatRoomId(myId, otherUser.id);

        router.push({
            pathname: "/chat",
            params: { roomId: roomId, contactName: otherUser.username }
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
        const filtered = friends.filter((u) =>
            u.username?.toLowerCase().includes(searchText.toLowerCase())
        );

        // Sort alphabetically
        const sorted = filtered.sort((a, b) =>
            a.username.localeCompare(b.username)
        );

        // Group by first letter
        const grouped = sorted.reduce((acc, user) => {
            const firstLetter = user.username.charAt(0).toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(user);
            return acc;
        }, {});

        return Object.keys(grouped).map(key => ({
            title: key,
            data: grouped[key]
        }));
    }, [friends, searchText]);


    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.userItem, { backgroundColor: colors.settingsBackground }]}
            onPress={() => openChat(item)}
        >
            <View style={[styles.avatar, { backgroundColor: colors.button }]}>
                <Text style={styles.avatarText}>{item.username?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{item.username}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <BackIcon
                        width={35}
                        height={25}
                        color={colors.iconFill}
                        fill={colors.iconFill}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.title }]}>New message</Text>
                <View style={{ width: 35 }} />
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
                <SearchIcon width={20} height={20} color={colors.iconFill} style={styles.searchIcon} />
                <TextInput
                    placeholder="Search contacts"
                    placeholderTextColor={colors.placeholder}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Static options for buttons */}
            <View style={[styles.actionsContainer, { backgroundColor: colors.settingsBackground }]}>
                <ActionItem label="New groupchat"
                    IconComponent={GroupIcon} 
                    colors={colors}
                />
                <ActionItem
                    label="Add new contact by Cipher tag"
                    IconComponent={AtIcon}
                    colors={colors}
                    onPress={handleAddByTag}
                />
                <ActionItem label="Add new contact by email"
                    IconComponent={MailIcon}
                    colors={colors}
                    isLast={true}
                    onPress={handleAddByEmail}
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
                        <Text style={[styles.letterHeader, { color: colors.placeholder }]}>{title}</Text>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <Text style={{ color: colors.placeholder, textAlign: 'center', marginTop: 20, paddingHorizontal: 40 }}>
                            {"You don't have any contacts yet.\nUse \"Add new contact\" above to find people."}
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const ActionItem = ({ label, IconComponent, colors, isLast, onPress }) => (
    <>
        <TouchableOpacity style={styles.actionItem} onPress={onPress}>
            <View style={styles.actionIconPlaceholder}>
                <IconComponent width={22} height={22} color={colors.iconFill} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>{label}</Text>
        </TouchableOpacity>
        {!isLast && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
    </>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    backBtn: {
        padding: 5,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
        marginTop: 10,
        marginBottom: 20,
    },
    searchIcon: {
        opacity: 0.5,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    actionsContainer: {
        borderRadius: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
        marginBottom: 20,
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
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 20,
        marginBottom: 10,
    },
    letterHeader: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 5,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 8,
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
