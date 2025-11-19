import BackIcon from "@/assets/icons/back.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const NotificationsScreen = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} stroke={"#fff"} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingBox}>
          <Text style={styles.nameText}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#aaa", true: "#00ff04" }}
            thumbColor={"#fff"}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212427",
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginRight: 35,
  },
  settingsContainer: {
    marginTop: 22,
    backgroundColor: "#383D42",
    borderRadius: 5,
  },
  settingBox: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default NotificationsScreen;