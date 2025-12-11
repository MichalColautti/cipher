import Logo from "@/assets/icons/logo.svg";
import { useAuth } from "@/contexts/authContext";
import { isUsernameTaken } from "@/services/userService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AuthScreen = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const { login, register, user, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/"); 
    }
  }, [user, loading, router]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      Alert.alert("Error", "Email and password are required");
      return;
    }

    let response;

    if (isRegistering) {
      if(await isUsernameTaken(username)){
        setError("Username is already taken");
        Alert.alert("Error", "Username is already taken");
        return;
      }
      if (!username.trim()) {
        setError("Username is required");
        Alert.alert("Error", "Username is required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      response = await register(username, email, password);
    } else {
      response = await login(email, password);
    }

    if (response.error) {
      setError(response.error);
      Alert.alert("Error", response.error);
      return;
    } 
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Logo width={100} height={100}/>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isRegistering ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Cipher tag"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        )}
        <View style={styles.switchContainer}>
          <Text style={styles.text}>
            {isRegistering ? "Already have an account?" : "New member?"}
          </Text>
          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchText}>
              {isRegistering ? " Login now" : " Register now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isRegistering ? "Register" : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212427",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },
  form: {
    width: "100%",
  },
  bottomContainer: {
    marginBottom: 30,
  },
  button: {
    padding: 15,
    backgroundColor: "#648BCE",
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    color: "#fff",
  },
  switchText: {
    color: "#648BCE",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  logo: {
    alignItems: "center",
    marginBottom: 30, 
  },
});

export default AuthScreen;
