import BackIcon from "@/assets/icons/back.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AboutScreen = () => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  const appVersion = "1.0.0";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingBox}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>App Version</Text>
          </View>
          <Text style={styles.versionText}>Cipher v{appVersion}</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox} onPress={() => {}}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>Terms of Service</Text>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox} onPress={() => {}}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>Privacy Policy</Text>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
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
    textContainer: {
      justifyContent: "center",
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 15,
    },
    versionText: {
      fontSize: 16,
      color: colors.placeholder,
    },
  });

export default AboutScreen;
