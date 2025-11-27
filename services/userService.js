import { auth, db } from "@/config/firebaseConfig";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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

export const getUserByEmail = async (email) => {
  if (!email) return null;

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
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
      addedAt: serverTimestamp(),
    });

    // Also add current user to friend's friends subcollection
    const currentUserData = await getUserById(currentUserId);
    await setDoc(doc(db, "users", friendUser.id, "friends", currentUserId), {
      username: currentUserData.username,
      email: currentUserData.email,
      addedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding friend:", error);
    return { error: error.message };
  }
};

export const getMyFriends = async (userId) => {
  const friendsRef = collection(db, "users", userId, "friends");
  const friendsSnapshot = await getDocs(friendsRef);

  const friendPromises = friendsSnapshot.docs.map((friendDoc) =>
    getUserById(friendDoc.id)
  );

  const friends = await Promise.all(friendPromises);

  return friends.filter((friend) => friend !== null);
};

export const updateUserEmail = async (
  currentEmail,
  password,
  newEmail,
  userId
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not found for re-authentication.");

  const credential = EmailAuthProvider.credential(currentEmail, password);
  await reauthenticateWithCredential(currentUser, credential);

  await updateEmail(currentUser, newEmail);

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { email: newEmail });
};

export const deleteUserAccount = async (userId, password) => {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("User is not authenticated or does not match.");
  }

  if (currentUser.email && password) {
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password
    );
    await reauthenticateWithCredential(currentUser, credential);
  }

  // Delete all subcollections
  const subcollections = ["sessions", "friends"];

  for (const subName of subcollections) {
    const subRef = collection(db, "users", userId, subName);
    const subSnapshot = await getDocs(subRef);
    for (const doc of subSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
  }

  await deleteDoc(doc(db, "users", userId));

  await deleteUser(currentUser);
};
