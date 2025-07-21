import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCDwXEsAaS_NBzP4ead84nLCIH6L4cfEYI",
    authDomain: "qr-generator-76f56.firebaseapp.com",
    projectId: "qr-generator-76f56",
    storageBucket: "qr-generator-76f56.firebasestorage.app",
    messagingSenderId: "984321009694",
    appId: "1:984321009694:web:6b7186b619114591e6a60f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
