import AtIcon from "@/assets/icons/at.svg";
import BackIcon from "@/assets/icons/back.svg";
import { useAuth } from "@/contexts/authContext";
import { changeUsername } from "@/services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const EditUsernameScreen = () => {
  const router = useRouter();
  const { user, updateUserContext } = useAuth();

  const params = useLocalSearchParams();
  const [username, setUsername] = useState(params.username || "");

  const handleSave = async () => {
    if (username.length < 3) {
      Alert.alert("Error", "Username needs to be at least 3 characters long.");
      return;
    }

    try {
      const success = await changeUsername(user.id, username);
      if (!success) return; 

      updateUserContext({ username: username });
      Alert.alert("Succes", "Username updated successfully.");
      router.back();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Couldn't update username.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={35} height={25} stroke={"#fff"} />
        </TouchableOpacity>
        <Text style={styles.title}>Username</Text>
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <AtIcon width={18} height={18} fill={"#fff"} />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Twoja nazwa użytkownika"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoFocus={true}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
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
  saveButton: {
    backgroundColor: "#007bff",
    fontSize: 18,
    fontWeight: "600",
    padding: 15,
    marginTop: 30,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  inputContainer: {
    backgroundColor: "#383D42",
    borderRadius: 5,
    paddingHorizontal: 15,
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    paddingVertical: 15,
  },
});

export default EditUsernameScreen;
