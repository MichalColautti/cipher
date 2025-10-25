import BackIcon from "@/assets/icons/back.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.replace("/");
          }}
        >
          <BackIcon width={35} height={25} stroke={"#fff"} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      {/* settings options */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <View style={styles.profileImg} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{user?.email}</Text>
              <Text style={styles.atText}>@{user?.username}</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
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
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginRight: 35,
  },
  profileImg: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#007bff",
  },
  settingsContainer: {
    marginTop: 22,
  },
  settingBox: {
    backgroundColor: "#383D42",
    borderRadius: 5,
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
  atText: {
    color: "#F9F6F0",
    opacity: 0.7,
    fontSize: 14,
  },
  forwardIcon: {
    alignContent: "center",
    justifyContent: "center",
  },
  leftOptionSection: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    justifyContent: "center",
  },
});

export default ProfileScreen;
