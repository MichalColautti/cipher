import BackIcon from "@/assets/icons/back.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useTheme } from "@/contexts/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DataStorageScreen = () => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  // States for auto-download settings
  const [wifiDownload, setWifiDownload] = useState("...");
  const [cellularDownload, setCellularDownload] = useState("...");
  const [loading, setLoading] = useState(false);

  // Load settings when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const wifiSetting = await AsyncStorage.getItem("autoDownload_wifi");
          const cellularSetting = await AsyncStorage.getItem(
            "autoDownload_cellular"
          );
          setWifiDownload(wifiSetting || "All Media"); // Default to 'All Media'
          setCellularDownload(cellularSetting || "Photos"); // Default to 'Photos'
        } catch (error) {
          console.error("Failed to load auto-download settings:", error);
        }
      };
      loadSettings();
    }, [])
  );

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the application cache? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await Image.clearDiskCache();
              await Image.clearMemoryCache();
              Alert.alert("Success", "Cache has been cleared successfully.");
            } catch (error) {
              console.error("Failed to clear cache:", error);
              Alert.alert(
                "Error",
                "An error occurred while clearing the cache."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Data and Storage</Text>
        <View style={{ width: 35 }} />
      </View>

      <Text style={styles.sectionTitle}>Manage storage</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox} onPress={handleClearCache}>
          <Text style={styles.nameText}>Clear Cache</Text>
          {loading && <ActivityIndicator size="small" color={colors.text} />}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Media auto download</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() =>
            router.push({
              pathname: "/profile/autoDownloadSettings",
              params: { settingType: "wifi", currentValue: wifiDownload, title: "When using Wi-Fi" },
            })
          }
        >
          <Text style={styles.nameText}>When using Wi-Fi</Text>
          <View style={styles.rightOptionSection}>
            <Text style={styles.optionValueText}>{wifiDownload}</Text>
            <ForwardIcon
              style={{ opacity: 0.4, marginLeft: 5 }}
              width={18}
              height={24}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() =>
            router.push({
              pathname: "/profile/autoDownloadSettings",
              params: { settingType: "cellular", currentValue: cellularDownload, title: "When using Cellular" },
            })
          }
        >
          <Text style={styles.nameText}>When using Cellular</Text>
          <View style={styles.rightOptionSection}>
            <Text style={styles.optionValueText}>{cellularDownload}</Text>
            <ForwardIcon
              style={{ opacity: 0.4, marginLeft: 5 }}
              width={18}
              height={24}
            />
          </View>
        </TouchableOpacity>
      </View>
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
    textContainer: {
      justifyContent: "center",
    },
    rightOptionSection: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionValueText: {
      color: colors.placeholder,
      fontSize: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 15,
    },
  });


export default DataStorageScreen;
