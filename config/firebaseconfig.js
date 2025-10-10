// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkW9hwpUcYgz88sT2h0pF75bL6vsIB0q0",
  authDomain: "cipher-1900e.firebaseapp.com",
  projectId: "cipher-1900e",
  storageBucket: "cipher-1900e.firebasestorage.app",
  messagingSenderId: "603216302223",
  appId: "1:603216302223:web:f5ffa4f5f6e2234ee720fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app);