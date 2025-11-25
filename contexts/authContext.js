import { auth, db } from "@/config/firebaseConfig";
import { runBackgroundKeygen } from "@/services/backgroundKeygen";
import { getPrivateKey } from "@/services/cryptoService";
import { getUserById } from "@/services/userService";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep auth state in sync and ensure background key generation runs when needed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserById(firebaseUser.uid);
        setUser(profile || null);

        // Ensure public/private key generation is running in background if missing
        try {
          const hasPublic = profile && profile.publicKey;
          const privateKey = await getPrivateKey(firebaseUser.uid);
          if (!hasPublic || !privateKey) {
            // Kick off background generation (non-blocking)
            runBackgroundKeygen(firebaseUser.uid)
              .then((res) => {
                console.log("Background keygen result:", res);
              })
              .catch((e) => console.error("Background keygen error:", e));
          }
        } catch (e) {
          console.warn("Error checking/starting background keygen:", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const signInResult = await signInWithEmailAndPassword(auth, email, password);

      // After sign-in, fire background keygen if publicKey is missing
      try {
        const uid = signInResult.user.uid;
        const profile = await getUserById(uid);
        if (!profile?.publicKey) {
          runBackgroundKeygen(uid).catch((e) => console.error("Background keygen error (login):", e));
        } else {
          // ensure private exists; if not, regenerate in background
          const privateKey = await getPrivateKey(uid);
          if (!privateKey) {
            runBackgroundKeygen(uid).catch((e) => console.error("Background keygen error (login private):", e));
          }
        }
      } catch (e) {
        console.warn("Error checking keys after login:", e);
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      // Create user account
      await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("User not found after registration");

      // Create minimal profile
      await setDoc(doc(db, "users", firebaseUser.uid), {
        username: username,
        email: email,
      });

      // Kick off background key generation (non-blocking)
      runBackgroundKeygen(firebaseUser.uid)
        .then((res) => {
          console.log("Background keygen (register) result:", res);
        })
        .catch((e) => console.error("Background keygen error (register):", e));

      // Continue to login flow (auth state change will update context)
      return login(email, password);
    } catch (error) {
      return { error: error.message };
    }
  };

  const logout = async () => {
    try {
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
