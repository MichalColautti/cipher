import BackIcon from "@/assets/icons/back.svg";
import { useTheme } from "@/contexts/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const NotificationsScreen = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { theme, colors } = useTheme();

  useEffect(() => {
    const loadNotificationSetting = async () => {
      try {
        const savedSetting = await AsyncStorage.getItem("notificationsEnabled");
        if (savedSetting !== null) {
          setNotificationsEnabled(JSON.parse(savedSetting));
        }
      } catch (error) {
        console.error("Error during loading notifications settings ", error);
      }
    };

    loadNotificationSetting();
  }, []);

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(value));
    } catch (error) {
      console.error("Error during saving notifications settings ", error);
    }
  };

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
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingBox}>
          <Text style={styles.nameText}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: colors.button }}
            thumbColor={"#fff"}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>
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
    nameText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
  });

export default NotificationsScreen;
