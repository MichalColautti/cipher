import BackIcon from "@/assets/icons/back.svg";
import CheckIcon from "@/assets/icons/check.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AppearanceScreen = () => {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState("dark"); 

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("colorTheme");
        if (savedTheme !== null) {
          setSelectedTheme(savedTheme);
        }
      } catch (error) {
        console.error("Error during loading appearance settings ", error);
      }
    };

    loadTheme();
  }, []);

  const handleSelectTheme = async (theme) => {
    setSelectedTheme(theme);
    try {
      await AsyncStorage.setItem("colorTheme", theme);
    } catch (error) {
      console.error("Error during saving appearance settings", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} stroke={"#fff"} />
        </TouchableOpacity>
        <Text style={styles.title}>Appearance</Text>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() => handleSelectTheme("light")}
        >
          <Text style={styles.nameText}>Light</Text>
          {selectedTheme === "light" && (
            <CheckIcon width={24} height={24} stroke={"#007bff"} />
          )}
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() => handleSelectTheme("dark")}
        >
          <Text style={styles.nameText}>Dark</Text>
          {selectedTheme === "dark" && (
            <CheckIcon width={24} height={24} stroke={"#007bff"} />
          )}
        </TouchableOpacity>
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
  divider: {
    height: 1,
    backgroundColor: "#F9F6F0",
    opacity: 0.15,
    marginLeft: 15,
  },
});

export default AppearanceScreen;