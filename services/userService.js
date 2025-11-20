import { db } from "@/config/firebaseConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
    serverTimestamp,
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

export const getUserByUsername = async (username) => {
  if (!username) return null;

  const usersRef = collection(db, "users");
  // Look for exact match
  const q = query(usersRef, where("username", "==", username));

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Return the first matched user, cipher tags are unique
    const userDoc = snapshot.docs[0];
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

export const addFriend = async (currentUserId, friendUser) => {
  try {
    // Add friend to current user's friends subcollection
    await setDoc(doc(db, "users", currentUserId, "friends", friendUser.id), {
      username: friendUser.username,
      addedAt: serverTimestamp()
    });

    // Also add current user to friend's friends subcollection
    const currentUserData = await getUserById(currentUserId);
    await setDoc(doc(db, "users", friendUser.id, "friends", currentUserId), {
      username: currentUserData.username,
      email: currentUserData.email,
      addedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding friend:", error);
    return { error: error.message };
  }
};

export const getMyFriends = async (userId) => {
  const friendsRef = collection(db, "users", userId, "friends");
  const snapshot = await getDocs(friendsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
