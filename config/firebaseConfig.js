import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCkW9hwpUcYgz88sT2h0pF75bL6vsIB0q0",
  authDomain: "cipher-1900e.firebaseapp.com",
  projectId: "cipher-1900e",
  storageBucket: "cipher-1900e.firebasestorage.app",
  messagingSenderId: "603216302223",
  appId: "1:603216302223:web:f5ffa4f5f6e2234ee720fa"
};

let app;
let auth;

// Prevent re-initialization
if (!getApps().length) {
  app = initializeApp(firebaseConfig);

  if (Platform.OS === 'web') {
    // Use default persistance in a web browser
    auth = getAuth(app);
  } else {
    // Use AsyncStorage on a mobile platform
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };