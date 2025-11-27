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
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <BackIcon
            width={35}
            height={25}
            color={colors.iconFill}
            fill={colors.iconFill}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* settings options */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingBox}
            onPress={() => {
              router.push("/profile/profileSettings");
            }}
          >
            <View style={styles.leftOptionSection}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileImg}
                />
              ) : (
                <View
                  style={[
                    styles.profileImg,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
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
              <AccountIcon width={24} height={24} color={colors.iconFill} />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>Account</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingBox}
            onPress={() => {
              router.push("/profile/linkedDevices");
            }}
          >
            <View style={styles.leftOptionSection}>
              <LinkedDevicesIcon
                width={24}
                height={24}
                color={colors.iconFill}
              />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>Linked devices</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingBox}>
            <View style={styles.leftOptionSection}>
              <PrivacyIcon width={24} height={24} color={colors.iconFill} />
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
              <AppearanceIcon width={24} height={24} color={colors.iconFill} />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>Appearance</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingBox}
            onPress={() =>
              router.push("/profile/profileSettings/notifications")
            }
          >
            <View style={styles.leftOptionSection}>
              <NotificationsIcon
                width={24}
                height={24}
                color={colors.iconFill}
              />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>Notifications</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingBox}
            onPress={() => router.push("/profile/dataStorage")}
          >
            <View style={styles.leftOptionSection}>
              <DataIcon width={24} height={24} color={colors.iconFill} />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>Data and Storage</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingBox}
            onPress={() => router.push("/profile/help")}
          >
            <View style={styles.leftOptionSection}>
              <HelptIcon width={24} height={24} color={colors.iconFill} />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>Help</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingBox}
            onPress={() => router.push("/profile/about")}
          >
            <View style={styles.leftOptionSection}>
              <AboutIcon width={24} height={24} color={colors.iconFill} />
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>About</Text>
              </View>
            </View>
            <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingBox} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    },
    title: {
      flex: 1,
      fontSize: 32,
      fontWeight: "bold",
      color: colors.title,
      textAlign: "center",
      marginRight: 35,
    },
    profileImg: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.button,
    },
    avatarText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 32,
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
    atText: {
      color: colors.placeholder,
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
      backgroundColor: colors.divider,
      marginLeft: 54,
    },
    logoutText: {
      color: "#E53935",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      flex: 1,
    },
  });

export default ProfileScreen;
