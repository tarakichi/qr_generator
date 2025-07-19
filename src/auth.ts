import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth"
import { auth, googleProvider } from "./firebase"

export const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
    await signOut(auth);
};

export const subscribeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
