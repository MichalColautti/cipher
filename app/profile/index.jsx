import AboutIcon from "@/assets/icons/about.svg";
import AccountIcon from "@/assets/icons/account.svg";
import AppearanceIcon from "@/assets/icons/appearance.svg";
import BackIcon from "@/assets/icons/back.svg";
import DataIcon from "@/assets/icons/data.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import HelptIcon from "@/assets/icons/help.svg";
import LinkedDevicesIcon from "@/assets/icons/linkedDevices.svg";
import NotificationsIcon from "@/assets/icons/notifications.svg";
import PrivacyIcon from "@/assets/icons/privacy.svg";
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
            router.back();
          }}
        >
          <BackIcon width={35} height={25} stroke={"#fff"} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      {/* settings options */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox} onPress={() => {router.push("/profile/profileSettings")}}>
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

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <AccountIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <LinkedDevicesIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Linked devices</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <PrivacyIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Privacy</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() => router.push("/profile/profileSettings/appearance")}
        >
          <View style={styles.leftOptionSection}>
            <AppearanceIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Appearance</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.settingBox}
          onPress={() => router.push("/profile/profileSettings/notifications")}
        >
          <View style={styles.leftOptionSection}>
            <NotificationsIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Notifications</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <DataIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Data and Storage</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <HelptIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Help</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <AboutIcon width={24} height={24} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>About</Text>
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
  divider: {
    height: 1,
    backgroundColor: "#F9F6F0",
    opacity: 0.15,
    marginLeft: 54,
  },
});

export default ProfileScreen;
