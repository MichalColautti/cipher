import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HomeScreen = () => {
  const { user, loading, logout } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : user ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Welcome: {user.username || user.email}</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "red",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    textAlign: "center",
    color: "#fff",
  },
});

export default HomeScreen;
