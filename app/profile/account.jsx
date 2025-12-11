import BackIcon from "@/assets/icons/back.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { deleteUserAccount } from "@/services/userService";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AccountScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = () => {
    router.push("/profile/changeEmail");
  };

  const handleDeletePress = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm.");
      return;
    }

    setLoading(true);
    try {
      await deleteUserAccount(user.id, password);

      setDeleteModalVisible(false);
      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted."
      );
      logout();
    } catch (error) {
      console.error("Error deleting account:", error);

      let msg = "Could not delete account.";
      if (error.code === "auth/wrong-password") msg = "Incorrect password.";

      Alert.alert("Error", msg);
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
        <Text style={styles.title}>Account</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox} onPress={handleChangeEmail}>
          <Text style={styles.nameText}>Change email</Text>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox} onPress={handleDeletePress}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. Please enter your password to
              confirm.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.deleteBtn]}
                onPress={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      marginBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.title,
    },
    settingsContainer: {
      marginTop: 22,
      backgroundColor: colors.settingsBackground,
      borderRadius: 8,
      ...(theme === "light" && {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
      }),
    },
    settingBox: {
      paddingVertical: 18,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    nameText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    deleteText: {
      color: "red",
      fontSize: 18,
      fontWeight: "600",
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.settingsBackground,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.title,
      marginBottom: 10,
    },
    modalText: {
      fontSize: 14,
      color: colors.text,
      textAlign: "center",
      marginBottom: 20,
      opacity: 0.8,
    },
    modalInput: {
      width: "100%",
      backgroundColor: theme === "light" ? "#f0f0f0" : "#2C2C2E",
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme === "light" ? "#ddd" : "#444",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: 10,
    },
    modalBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelBtn: {
      backgroundColor: theme === "light" ? "#e0e0e0" : "#444",
    },
    deleteBtn: {
      backgroundColor: "red",
    },
    btnText: {
      fontWeight: "600",
      fontSize: 16,
      color: colors.text,
    },
  });

export default AccountScreen;
