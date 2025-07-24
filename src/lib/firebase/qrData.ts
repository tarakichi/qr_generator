import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import type { LabelEntry, QRData } from "../../types";

export const addQRData = async (value: string, label: LabelEntry[]) => {
    const user = auth.currentUser;
    if (!user) throw new Error("ログインが必要です");

    try {
        const docRef = await addDoc(collection(db, "qrCodes"), {
            value,
            label,
            uid: user.uid,
            createdAt: serverTimestamp(),
        });
    
        return docRef.id;
    } catch (error) {
        console.log("データの保存に失敗しました", error);
    }
};

export const deleteQRData = async (id: string) => {
    try {
        await deleteDoc(doc(db, "qrCodes", id));
        console.log("削除しました", id);
    } catch (error) {
        console.log("削除に失敗しました", error);
    }
}

export const subscribeQRData = (callback: (data: QRData[]) => void) => {
    const q = query(collection(db, "qrCodes"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<QRData, "id">),
        }));
        callback(data);
    });
};

export const updateQRLabel = async (qrId: string, newLabelList: LabelEntry[]) => {
    const ref = doc(db, "qrCodes", qrId);
    await updateDoc(ref, { label: newLabelList });
}
