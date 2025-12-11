import BackIcon from "@/assets/icons/back.svg";
import CheckIcon from "@/assets/icons/check.svg";
import MoonIcon from "@/assets/icons/moon.svg";
import SunIcon from "@/assets/icons/sun.svg";
import ColorSelector from "@/components/colorSelector";
import {
  darkThemeColors,
  lightThemeColors,
  useTheme,
} from "@/contexts/themeContext";

import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AppearanceScreen = () => {
  const router = useRouter();
  const {
    theme,
    toggleTheme,
    colors,
    changeOutgoingBubbleColor,
    customOutgoingBubbleColor,
    changeIncomingBubbleColor,
    customIncomingBubbleColor,
    changeChatBackgroundColor,
    customChatBackgroundColor,
  } = useTheme();
  const styles = getStyles(colors, theme);

  const defaultOutgoing = theme === "light" ? lightThemeColors.outgoingBubble : darkThemeColors.outgoingBubble;
  const outgoingColors = [
    defaultOutgoing, 
    "#72d5ffff", 
    "#00ffaeff", 
    "#ff0015ff",
    "#cf94ffff", 
    "#ff7300ff",
  ];

  const defaultIncoming = theme === "light" ? lightThemeColors.incomingBubble : darkThemeColors.incomingBubble;
  const incomingColors = [
    defaultIncoming, 
    "#72d5ffff", 
    "#00ffaeff", 
    "#ff0015ff",
    "#cf94ffff", 
    "#ff7300ff",
  ];

  const defaultChatBackground = theme === "light" ? lightThemeColors.chatBackground : darkThemeColors.chatBackground;
  const chatBackgroundColors = [
    defaultChatBackground, 
    "#72d5ffff", 
    "#00ffaeff", 
    "#ff0015ff",
    "#cf94ffff", 
    "#ff7300ff",
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Appearance</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Theme selector */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>App Theme</Text>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingBox} onPress={() => toggleTheme("light")}>
            <View style={styles.leftOptionSection}>
              <SunIcon width={24} height={24} color={colors.iconFill} fill={colors.iconFill} />
              <Text style={styles.nameText}>Light</Text>
            </View>
            {theme === "light" && <CheckIcon width={24} height={24} color={colors.iconFill} />}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox} onPress={() => toggleTheme("dark")}>
            <View style={styles.leftOptionSection}>
              <MoonIcon width={24} height={24} color={colors.iconFill} fill={colors.iconFill} />
              <Text style={styles.nameText}>Dark</Text>
            </View>
            {theme === "dark" && <CheckIcon width={24} height={24} color={colors.iconFill} />}
          </TouchableOpacity>
        </View>

        {/* Outgoing Bubble */}
        <ColorSelector
          title="My Messages"
          palette={outgoingColors}
          activeColor={customOutgoingBubbleColor}
          onSelect={changeOutgoingBubbleColor}
        />

        {/* Incoming Bubble */}
        <ColorSelector
          title="Incoming Messages"
          palette={incomingColors}
          activeColor={customIncomingBubbleColor}
          onSelect={changeIncomingBubbleColor}
        />

        {/* Background */}
        <ColorSelector
          title="Background Wallpaper"
          palette={chatBackgroundColors}
          activeColor={customChatBackgroundColor}
          onSelect={changeChatBackgroundColor}
          isBackground={true}
        />

      </ScrollView>
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
      flex: 1,
      fontSize: 24,
      fontWeight: "bold",
      color: colors.title,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.placeholder,
      marginTop: 28,
      marginBottom: 10,
      marginLeft: 5,
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
    colorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      padding: 15,
    },
    colorCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      margin: 10,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
  });

export default AppearanceScreen;