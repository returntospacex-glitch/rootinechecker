import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA0oAJVfxVXKsd17Q8Z05ip2YDt4tR6yoY",
    authDomain: "everyday-4725f.firebaseapp.com",
    projectId: "everyday-4725f",
    storageBucket: "everyday-4725f.firebasestorage.app",
    messagingSenderId: "981419359851",
    appId: "1:981419359851:web:981689374df891282bfb2e",
    measurementId: "G-084C5L6BTP"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup };
