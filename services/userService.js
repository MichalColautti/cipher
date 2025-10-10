import { db } from "@/config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export const isUsernameTaken = async (username) => {
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(userQuery);
    return !querySnapshot.empty;
};