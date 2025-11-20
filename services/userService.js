import { db } from "@/config/firebaseConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import { Alert } from "react-native";

export const isUsernameTaken = async (username) => {
  const usersRef = collection(db, "users");
  const userQuery = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(userQuery);
  return !querySnapshot.empty;
};

export const getUserById = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
};

export const changeUsername = async (userId, newUsername) => {
  if (await isUsernameTaken(newUsername)) {
    Alert.alert("Username already taken");
    return false;
  }
  const userDocRef = doc(db, "users", userId);
  await setDoc(userDocRef, { username: newUsername }, { merge: true });
  return true;
};
