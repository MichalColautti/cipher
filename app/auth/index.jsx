import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AuthScreen = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {isRegistering ? <Text>Regiser</Text> : <Text>Login</Text>}
      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text>
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
