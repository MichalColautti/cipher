import BackIcon from "@/assets/icons/back.svg";
import CheckIcon from "@/assets/icons/check.svg";
import { useTheme } from "@/contexts/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const OPTIONS = ["Never", "Photos", "All Media"];

const AutoDownloadSettingsScreen = () => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  const { settingType, currentValue, title } = useLocalSearchParams();

  const handleSelect = async (option) => {
    try {
      const key = `autoDownload_${settingType}`;
      await AsyncStorage.setItem(key, option);
      router.back();
    } catch (error) {
      console.error("Failed to save auto-download setting:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.settingsContainer}>
        {OPTIONS.map((option, index) => (
          <React.Fragment key={option}>
            <TouchableOpacity
              style={styles.settingBox}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.nameText}>{option}</Text>
              {currentValue === option && (
                <CheckIcon width={24} height={24} color={colors.button} />
              )}
            </TouchableOpacity>
            {index < OPTIONS.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
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
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 15,
    },
  });

export default AutoDownloadSettingsScreen;