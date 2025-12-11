import BackIcon from "@/assets/icons/back.svg";
import DesktopIcon from "@/assets/icons/desktop.svg";
import MobileIcon from "@/assets/icons/mobile.svg";
import { auth, db } from "@/config/firebaseConfig";
import { useTheme } from "@/contexts/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LinkedDevicesScreen = () => {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const currentSessionId = await AsyncStorage.getItem("currentSessionId");

      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const snapshot = await getDocs(sessionsRef);

      const loadedDevices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isCurrent: doc.id === currentSessionId,
        lastActiveFormatted: formatTimestamp(doc.data().lastActive),
      }));

      loadedDevices.sort((a, b) => b.isCurrent - a.isCurrent);

      setDevices(loadedDevices);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to fetch linked devices.");
    } finally {
      setLoading(false);
    }
  };

  const logoutDevice = async (deviceId, deviceName) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(doc(db, "users", user.uid, "sessions", deviceId));

      setDevices((prev) => prev.filter((d) => d.id !== deviceId));

      Alert.alert("Success", `${deviceName} has been removed.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to remove device.");
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const renderDeviceIcon = (type) => {
    if (type === "mobile") {
      return <MobileIcon width={32} height={32} color={colors.iconFill} />;
    }
    return <DesktopIcon width={32} height={32} color={colors.iconFill} />;
  };

  const renderItem = ({ item }) => (
    <View style={styles.deviceItem}>
      {renderDeviceIcon(item.deviceType)}
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.deviceName}</Text>

        <Text
          style={[styles.deviceLastActive, item.isCurrent && styles.activeNow]}
        >
          {item.isCurrent ? "Active now" : item.lastActiveFormatted}
        </Text>
      </View>
      {!item.isCurrent && (
        <TouchableOpacity
          onPress={() => logoutDevice(item.id, item.deviceName)}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
        </TouchableOpacity>
        <Text style={styles.title}>Linked Devices</Text>
        <View style={{ width: 35 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          size="large"
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 20 }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: colors.placeholder,
              }}
            >
              No active sessions found.
            </Text>
          }
        />
      )}
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
    deviceItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },
    deviceInfo: {
      flex: 1,
      marginLeft: 16,
    },
    deviceName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    deviceLocation: {
      fontSize: 14,
      color: colors.placeholder,
      marginBottom: 2,
    },
    deviceLastActive: {
      fontSize: 14,
      color: colors.placeholder,
    },
    activeNow: {
      color: "#2E7D32",
      fontWeight: "bold",
    },
    logoutText: {
      color: "#E53935",
      fontWeight: "600",
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 48,
    },
  });

export default LinkedDevicesScreen;
