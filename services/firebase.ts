// examsync-ai/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// --- PASTE YOUR CONFIG FROM FIREBASE CONSOLE BELOW ---
const firebaseConfig = {
  apiKey: "AIzaSyAmxhMWmzr--1I1Fe1YTnm_ZG_QL8lUWYU",
  authDomain: "examsync-32655.firebaseapp.com",
  projectId: "examsync-32655",
  storageBucket: "examsync-32655.firebasestorage.app",
  messagingSenderId: "866391249760",
  appId: "1:866391249760:web:7a05b7eb06b6122f7ac405",
  measurementId: "G-CH1167Z1FR"
};
// ----------------------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed", error);
  }
};

export const logout = () => signOut(auth);