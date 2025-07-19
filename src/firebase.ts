import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import type { LabelEntry, QRData } from "./types";

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

export const addQRData = async (value: string, labelList: LabelEntry[]) => {
    try {
        const docRef = await addDoc(collection(db, "qrCodes"), {
            value,
            label: labelList,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.log("データの保存に失敗しました", error);
        throw error;
    }
};

export const fetchQRData = async () => {
    const snapshot = await getDocs(query(collection(db, "qrCodes"), orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export const subscribeQRData = (callback: (data: QRData[]) => void) => {
    const q = query(collection(db, "qrCodes"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as QRData[];
        callback(data);
    });
};

export const deleteQRData = async (id: string) => {
    try {
        await deleteDoc(doc(db, "qrCodes", id));
        console.log(`✅ Deleted QRData with id: ${id}`);
    } catch (error) {
        console.error("❌ 削除に失敗しました:", error);
    }
};