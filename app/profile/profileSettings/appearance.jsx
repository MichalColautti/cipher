import BackIcon from "@/assets/icons/back.svg";
import CheckIcon from "@/assets/icons/check.svg";
import MoonIcon from "@/assets/icons/moon.svg";
import SunIcon from "@/assets/icons/sun.svg";

import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AppearanceScreen = () => {
  const router = useRouter();
  const { theme, toggleTheme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon
            width={35}
            height={25}
            color={colors.iconFill}
            fill={colors.iconFill}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Appearance</Text>
      </View>

      <View style={styles.settingsContainer}>
        {/* LIGHT MODE */}
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() => toggleTheme("light")}
        >
          <View style={styles.leftOptionSection}>
            <SunIcon width={24} height={24} color={colors.iconFill} fill={colors.iconFill} />
            <Text style={styles.nameText}>Light</Text>
          </View>
          {theme === "light" && (
            <CheckIcon width={24} height={24} color={colors.iconFill} />
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* DARK MODE */}
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() => toggleTheme("dark")}
        >
          <View style={styles.leftOptionSection}>
            <MoonIcon width={24} height={24} color={colors.iconFill} fill={colors.iconFill} />
            <Text style={styles.nameText}>Dark</Text>
          </View>
          {theme === "dark" && (
            <CheckIcon width={24} height={24} color={colors.iconFill} />
          )}
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
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
      }),
    },
    settingBox: {
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftOptionSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    nameText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 54,
    },
  });

export default AppearanceScreen;