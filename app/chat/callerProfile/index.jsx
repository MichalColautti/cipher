import BackIcon from "@/assets/icons/back.svg";
import BlockIcon from "@/assets/icons/block.svg";
import ColorIcon from "@/assets/icons/color.svg";
import ForwardIcon from "@/assets/icons/forward.svg";
import GroupIcon from "@/assets/icons/group.svg";
import MultimediaIcon from "@/assets/icons/multimedia.svg";
import NicknameIcon from "@/assets/icons/nickname.svg";
import BellIcon from "@/assets/icons/notifications.svg";
import ShieldIcon from "@/assets/icons/privacy.svg";
import ReportIcon from "@/assets/icons/report.svg";
import SearchIcon from "@/assets/icons/search.svg";
import VanishingMessagesIcon from "@/assets/icons/vanishingMessages.svg";

import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const CallerProfileScreen = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} stroke="#fff" />
        </TouchableOpacity>
      </View>

      {/* Customization */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImg} />
          <Text style={styles.profileName}>{user.username}</Text>
        </View>

        <Text style={styles.sectionLabel}>Customization</Text>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingBox}>
            <NicknameIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Nickname</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox}>
            <ColorIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>
                Color and conversation background
              </Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
        </View>

        {/* More actions */}
        <Text style={styles.sectionLabel}>More actions</Text>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingBox}>
            <GroupIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Create a groupchat with Tom</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox}>
            <MultimediaIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Browse multimedia</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox}>
            <SearchIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Search in conversation</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox}>
            <BellIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Sounds and notifications</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
        </View>

        {/* Help and privacy */}
        <Text style={styles.sectionLabel}>Help and privacy</Text>
        <View style={[styles.settingsContainer, { marginBottom: 30 }]}>
          <TouchableOpacity style={styles.settingBox}>
            <VanishingMessagesIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Vanishing messages</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox}>
            <ShieldIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Display security number</Text>
            </View>
            <ForwardIcon width={18} height={20} style={styles.forwardIcon} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.settingBox, { marginTop: 5 }]}>
            <BlockIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={[styles.nameText, { color: "#DC2626" }]}>
                Block this person
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingBox}>
            <ReportIcon width={22} height={22} />
            <View style={styles.textContainer}>
              <Text style={[styles.nameText, { color: "#DC2626" }]}>
                Report spam
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212427",
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 60,
    marginBottom: 10,
    marginLeft: 6,
  },
  profileImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginVertical: 10,
    backgroundColor: "#007bff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileUsername: {
    color: "#b0b4bb",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 18,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 6,
    marginLeft: 26,
    color: "#B0B4BB",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  settingsContainer: {
    backgroundColor: "#383D42",
    borderRadius: 8,
    marginHorizontal: 13,
    marginBottom: 0,
  },
  settingBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
  },
  divider: {
    height: 1,
    backgroundColor: "#F9F6F0",
    opacity: 0.13,
    marginLeft: 55,
    marginRight: 0,
  },
  nameText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 18,
  },
  textContainer: {
    justifyContent: "center",
  },
  forwardIcon: {
    marginLeft: "auto",
    opacity: 0.29,
  },
});

export default CallerProfileScreen;
