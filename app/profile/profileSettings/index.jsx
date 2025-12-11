import AccountIcon from "@/assets/icons/account.svg";
import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import EditIcon from "@/assets/icons/edit.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";
import { uploadImage } from "@/services/imageService";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileSettingsScreen = () => {
  const router = useRouter();
  const { user, updateUserContext } = useAuth();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors, theme);
  const [loading, setLoading] = useState(false);

  const handleUpdatePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        const localUri = result.assets[0].uri;

        const cloudUrl = await uploadImage(localUri);

        if (!cloudUrl) {
          throw new Error("Could not load the photo.");
        }

        const db = getFirestore();
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          profileImage: cloudUrl,
        });

        if (updateUserContext) {
          updateUserContext({ ...user, profileImage: cloudUrl });
        }

        Alert.alert("Success", "Profile picture has been changed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error ocurred while changing the profile picture.");
    } finally {
      setLoading(false);
    }
  };

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
        <TouchableOpacity onPress={handleUpdatePhoto} disabled={loading}>
          {loading ? (
            <View
              style={[
                styles.profileImg,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ActivityIndicator size="small" color={colors.text} />
            </View>
          ) : user?.profileImage ? (
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
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editPhotoBtn}
          onPress={handleUpdatePhoto}
          disabled={loading}
        >
          <Text style={styles.editPhotoBtnText}>
            {loading ? "Uploading..." : "Edit photo"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <AccountIcon width={24} height={24} color={colors.iconFill} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{user?.nickname || "Displayed name"}</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.4 }} width={18} height={24} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingBox}>
          <View style={styles.leftOptionSection}>
            <EditIcon width={24} height={24} color={colors.iconFill} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Your bio</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.4 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subText}>
        Your profile and any changes you make to it are visible to people you
        message, as well as your contacts and groups.
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
              <Text style={styles.nameText}>Cipher tag</Text>
            </View>
          </View>
          <ForwardIcon style={{ opacity: 0.4 }} width={18} height={24} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subText}>
        Other people can now message you using your cipher tag.
      </Text>
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
      marginBottom: 28,
    },
    title: {
      flex: 1,
      fontSize: 24,
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
      overflow: "hidden",
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
      paddingHorizontal: 15,
      marginVertical: 15,
      lineHeight: 17,
      textAlign: "left",
    },
  });

export default ProfileSettingsScreen;
