import { auth, db } from "@/config/firebaseConfig";
import { runBackgroundKeygen } from "@/services/backgroundKeygen";
import { getPrivateKey } from "@/services/cryptoService";
import { getUserById } from "@/services/userService";
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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Keep auth state in sync and ensure background key generation runs when needed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserById(firebaseUser.uid);
          setUser(profile || null);

          try {
            const hasPublic = profile && profile.publicKey;
            const privateKey = await getPrivateKey(firebaseUser.uid);
            if (!hasPublic || !privateKey) {
              runBackgroundKeygen(firebaseUser.uid)
                .then((res) => console.log("Background keygen result:", res))
                .catch((e) => console.error("Background keygen error:", e));
            }
          } catch (e) {
            console.warn("Error checking/starting background keygen:", e);
          }
        } catch (e) {
          console.warn("Failed to load profile on auth change:", e);
          setUser(null);
        }
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
      try {
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
      } catch (e) {
        console.warn("startSessionListener error:", e);
      }
    };

    startSessionListener();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [user]);

  const registerSession = async (userId) => {
    try {
      let deviceName = "Unknown Device";
      let deviceType = "mobile";

      try {
        if (Platform.OS === "web") {
          deviceName = "Web Browser / Desktop";
          deviceType = "desktop";
        } else {
          deviceType = "mobile";
          deviceName = Device.modelName || `${Device.osName || "Mobile"} Device`;
        }
      } catch (e) {
        // fallback
      }

      const sessionRef = await addDoc(
        collection(db, "users", userId, "sessions"),
        {
          deviceName,
          deviceType,
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

      try {
        await registerSession(userCredential.user.uid);
      } catch (e) {
        console.warn("Failed to register session after login:", e);
      }

      // non-blocking: ensure keys exist / start background generation if missing
      (async () => {
        try {
          const uid = userCredential.user.uid;
          const profile = await getUserById(uid);
          if (!profile?.publicKey) {
            runBackgroundKeygen(uid).catch((e) =>
              console.error("Background keygen error (login):", e)
            );
          } else {
            const privateKey = await getPrivateKey(uid);
            if (!privateKey) {
              runBackgroundKeygen(uid).catch((e) =>
                console.error("Background keygen error (login private):", e)
              );
            }
          }
        } catch (e) {
          console.warn("Error checking keys after login:", e);
        }
      })();

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

      const firebaseUser = userCredentials.user;
      if (!firebaseUser) throw new Error("User not found after registration");

      await setDoc(doc(db, "users", firebaseUser.uid), {
        username,
        email,
      });

      try {
        await registerSession(firebaseUser.uid);
      } catch (e) {
        console.warn("Failed to register session after register:", e);
      }

      runBackgroundKeygen(firebaseUser.uid)
        .then((res) => console.log("Background keygen (register) result:", res))
        .catch((e) => console.error("Background keygen error (register):", e));

      return login(email, password);
    } catch (error) {
      return { error: error.message };
    }
  };

  const handleLocalLogout = async () => {
    try {
      await AsyncStorage.removeItem("currentSessionId");
    } catch (e) {
      /* ignore */
    }
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
