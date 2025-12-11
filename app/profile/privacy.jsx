import BackIcon from "@/assets/icons/back.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useTheme } from "@/contexts/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIVACY_PREVIEW_KEY = "privacy_show_preview";

const PrivacyScreen = () => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(PRIVACY_PREVIEW_KEY);
        if (savedValue !== null) {
          setShowPreview(JSON.parse(savedValue));
        }
      } catch (error) {
        console.error("Failed to load privacy setting:", error);
      }
    };
    loadSetting();
  }, []);

  const handleTogglePreview = async (value) => {
    setShowPreview(value);
    try {
      await AsyncStorage.setItem(PRIVACY_PREVIEW_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save privacy setting:", error);
      Alert.alert("Error", "Could not save your preference.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox} onPress={() => { /* Navigate to blocked users screen */ }}>
          <Text style={styles.nameText}>Blocked Users</Text>
          <ForwardIcon style={{ opacity: 0.4 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.settingsContainer}>
        <View style={styles.settingBox}>
          <Text style={styles.nameText}>Show Preview</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={showPreview ? colors.button : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleTogglePreview}
            value={showPreview}
          />
        </View>
      </View>
      <Text style={styles.descriptionText}>
        Show message content in notifications on the lock screen.
      </Text>
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
      marginBottom: 30,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.title,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.placeholder,
      marginTop: 28,
      marginBottom: 10,
      marginLeft: 5,
      letterSpacing: 0.5,
    },
    settingsContainer: {
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
    descriptionText: {
      color: colors.placeholder,
      fontSize: 14,
      marginTop: 10,
      marginLeft: 15,
      marginRight: 15,
    },
  });

export default PrivacyScreen;
