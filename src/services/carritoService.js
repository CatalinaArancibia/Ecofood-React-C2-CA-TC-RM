import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const guardarCarritoFirestore = async (uid, carrito) => {
    await setDoc(doc(db, "carritos", uid), {
        usuarioId: uid,
        items: carrito
    });
};

export const cargarCarritoFirestore = async (uid) => {
    const ref = doc(db, "carritos", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().items : [];
};
