import AccountIcon from "@/assets/icons/account.svg";
import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import EditIcon from "@/assets/icons/edit.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ProfileSettingsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImg} />
        <TouchableOpacity style={styles.editPhotoBtn}>
          <Text style={styles.editPhotoBtnText}>Edytuj zdjęcie</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <AccountIcon width={24} height={24} color={colors.iconFill} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{user.username}</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <EditIcon width={24} height={24} color={colors.iconFill} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>O mnie</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subText}>
        Twój profil oraz wprowadzane w nim zmiany są widoczne dla osób, z
        którymi wymieniasz wiadomości, a także Twoich kontaktów i grup.
      </Text>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.settingBox}
          onPress={() =>
            router.push({
              pathname: "/profile/profileSettings/editUsername",
              params: { username: user.username },
            })
          }
        >
          <View style={styles.leftOptionSection}>
            <AtIcon width={18} height={18} color={colors.iconFill} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Nazwa użytkownika</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.29 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subText}>
        Inne osoby mogą teraz wysyłać Ci wiadomości za pomocą Twojej opcjonalnej
        nazwy użytkownika.
      </Text>
    </View>
  );
};

const getStyles = (colors) =>
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
    settingsContainer: {
      marginTop: 22,
      backgroundColor: colors.settingsBackground,
      borderRadius: 5,
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
    profileSection: {
      alignItems: "center",
      marginBottom: 16,
    },
    editPhotoBtn: {
      marginTop: 10,
      backgroundColor: colors.settingsBackground,
      borderRadius: 16,
      paddingHorizontal: 23,
      paddingVertical: 5,
    },
    editPhotoBtnText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 15,
    },
    subText: {
      color: colors.placeholder,
      fontSize: 13,
      paddingHorizontal: 26,
      marginVertical: 15,
      lineHeight: 17,
      textAlign: "left",
    },
  });

export default ProfileSettingsScreen;
