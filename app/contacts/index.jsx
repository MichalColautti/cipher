import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import MailIcon from "@/assets/icons/mail.svg";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import {
  addFriend,
  getUserByEmail,
  getUserByUsername,
} from "@/services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AddContactScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const method = (params.method || "tag").toString().toLowerCase();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isTag = method === "tag";
  const title = isTag ? "Add by Cipher tag" : "Add by Email";
  const placeholder = isTag ? "username" : "email@example.com";
  const Icon = isTag ? AtIcon : MailIcon;

  const handleAdd = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      let friendUser = null;
      if (isTag) {
        friendUser = await getUserByUsername(value.trim());
      } else {
        friendUser = await getUserByEmail(value.trim());
      }

      if (!friendUser) {
        setLoading(false);
        return;
      }

      // check if self-add
      const myId = user.id || user.uid;
      if (friendUser.id === myId) {
        setLoading(false);
        return;
      }

      // check if already friends
      const friendDocRef = doc(db, "users", myId, "friends", friendUser.id);
      const friendDocSnap = await getDoc(friendDocRef);
      if (friendDocSnap.exists()) {
        setLoading(false);
        return;
      }

      // add friend
      const result = await addFriend(myId, {
        id: friendUser.id,
        username: friendUser.username,
        email: friendUser.email,
        profileImage: friendUser.profileImage || null,
      });
    } catch (err) {
      console.error("Add contact failed:", err);
      Alert.alert("Error", err.message || "Could not add contact.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconStroke} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Icon width={18} height={18} fill={colors.iconFill} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoFocus
          keyboardType={isTag ? "default" : "email-address"}
        />
      </View>

      {/* Add button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.7 }]}
        onPress={handleAdd}
        disabled={loading}
        accessibilityLabel="Add contact"
      >
        <Text style={styles.saveButtonText}>
          {loading ? (isTag ? "Adding..." : "Sending...") : "ADD"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 22,
    },
    header: {
      alignItems: "center",
      marginTop: 30,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "700",
      color: colors.title,
      textAlign: "center",
      marginRight: 35,
    },
    inputContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 18,
      paddingVertical: 14,
      marginLeft: 10,
    },
    saveButton: {
      backgroundColor: colors.button,
      fontSize: 18,
      fontWeight: "600",
      padding: 14,
      marginTop: 24,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: "700",
    },
  });

export default AddContactScreen;
