import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { changeUsername } from "@/services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EditUsernameScreen = () => {
  const router = useRouter();
  const { user, updateUserContext } = useAuth();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  const params = useLocalSearchParams();
  const [username, setUsername] = useState(params.username || "");

  const handleSave = async () => {
    if (username.length < 3) {
      Alert.alert("Error", "Cipher tag needs to be at least 3 characters long.");
      return;
    }

    try {
      const success = await changeUsername(user.id, username);
      if (!success) return;

      updateUserContext({ username: username });
      Alert.alert("Succes", "Cipher tag updated successfully.");
      router.back();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Couldn't update cipher tag.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconStroke} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Cipher tag</Text>
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <AtIcon width={18} height={18} fill={colors.iconFill} />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Cipher tag"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoFocus={true}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors, theme) =>
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
      fontWeight: "bold",
      color: colors.title,
      textAlign: "center",
      marginRight: 35,
    },
    saveButton: {
      backgroundColor: "#648BCE",
      fontSize: 18,
      fontWeight: "600",
      padding: 15,
      marginTop: 30,
      borderRadius: 5,
      alignItems: "center",
    },
    saveButtonText: {
      color: colors.buttonText,
      fontSize: 18,
      fontWeight: "600",
    },
    inputContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginTop: 40,
      flexDirection: "row",
      alignItems: "center",
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
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 18,
      paddingVertical: 15,
      marginLeft: 10,
    },
  });

export default EditUsernameScreen;
