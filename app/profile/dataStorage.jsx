import BackIcon from "@/assets/icons/back.svg";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DataStorageScreen = () => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

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
          <BackIcon width={35} height={25} color={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Data and Storage</Text>
        <View style={{ width: 35 }} />
      </View>

      <Text style={styles.sectionTitle}>MANAGE STORAGE</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox} onPress={handleClearCache}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>Clear Cache</Text>
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
  });

export default DataStorageScreen;
