import { auth, db } from "@/config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { getUserById } from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserById(user.uid);
        console.log("Got user:", profile.username, profile.email);
        setUser(profile || null);
      } else {
        setUser(null);
        setCurrentSessionId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for session deletion to auto-logout
  useEffect(() => {
    let unsubscribeSnapshot;

    const startSessionListener = async () => {
      const savedSessionId = await AsyncStorage.getItem("currentSessionId");
      const currentUser = auth.currentUser;

      if (user && currentUser && savedSessionId) {
        setCurrentSessionId(savedSessionId);

        const sessionRef = doc(
          db,
          "users",
          currentUser.uid,
          "sessions",
          savedSessionId
        );

        unsubscribeSnapshot = onSnapshot(
          sessionRef,
          (docSnapshot) => {
            if (!docSnapshot.exists() && auth.currentUser) {
              console.log("Sesja usunięta zdalnie - wylogowywanie...");

              Alert.alert(
                "Sesja wygasła",
                "Zostałeś wylogowany z tego urządzenia zdalnie.",
                [{ text: "OK" }]
              );

              handleLocalLogout();
            }
          },
          (error) => {
            console.log("Błąd nasłuchiwania sesji:", error);
          }
        );
      }
    };

    startSessionListener();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [user]);

  const registerSession = async (userId) => {
    try {
      let deviceName = Device.modelName;
      let deviceType = "mobile";

      if (Platform.OS === "web") {
        deviceName = "Web Browser / Desktop";
        deviceType = "desktop";
      } else {
        deviceType = "mobile";

        if (!deviceName) {
          deviceName = `${Device.osName || "Mobile"} Device`;
        }
      }

      const sessionRef = await addDoc(
        collection(db, "users", userId, "sessions"),
        {
          deviceName: deviceName,
          deviceType: deviceType,
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp(),
        }
      );

      await AsyncStorage.setItem("currentSessionId", sessionRef.id);
    } catch (e) {
      console.error("Error registering session:", e);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await registerSession(userCredential.user.uid);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredentials.user;
      if (!user) throw new Error("User not found after registration");

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
      });

      await registerSession(user.uid);

      return login(email, password);
    } catch (error) {
      return { error: error.message };
    }
  };

  const handleLocalLogout = async () => {
    await AsyncStorage.removeItem("currentSessionId");
    setCurrentSessionId(null);
    await signOut(auth);
    setUser(null);
  };

  const logout = async () => {
    try {
      const sessionId = await AsyncStorage.getItem("currentSessionId");
      const currentUser = auth.currentUser;

      if (sessionId && currentUser) {
        await deleteDoc(
          doc(db, "users", currentUser.uid, "sessions", sessionId)
        );
        await AsyncStorage.removeItem("currentSessionId");
      }

      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const updateUserContext = (newUserData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...newUserData };
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, updateUserContext }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
