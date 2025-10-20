import { db } from "@/config/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

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