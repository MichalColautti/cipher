import BackIcon from "@/assets/icons/back.svg";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { updateUserEmail } from "@/services/userService";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ChangeEmailScreen = () => {
  const router = useRouter();
  const { user, updateUserContext } = useAuth();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!newEmail.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      await updateUserEmail(user.email, password, newEmail, user.id);

      updateUserContext({ email: newEmail });

      Alert.alert("Success", "Your email has been updated successfully.");
      router.back();
    } catch (error) {
      console.error("Error updating email:", error);
      Alert.alert(
        "Error",
        error.code === "auth/wrong-password"
          ? "Incorrect password. Please try again."
          : "Could not update email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Email</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="New email address"
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Current password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.buttonText} />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors, theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 22 },
    header: {
      alignItems: "center",
      marginTop: 30,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    title: { fontSize: 24, fontWeight: "bold", color: colors.title },
    inputContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    input: {
      color: colors.text,
      fontSize: 16,
      paddingVertical: 15,
    },
    saveButton: {
      backgroundColor: "#648BCE",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    saveButtonText: {
      color: colors.buttonText,
      fontSize: 18,
      fontWeight: "600",
    },
  });

export default ChangeEmailScreen;
