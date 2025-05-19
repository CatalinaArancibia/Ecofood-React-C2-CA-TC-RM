import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // 👈 usamos db directamente, sin app

/**
 * Obtiene los datos del usuario desde Firestore
 * @param {string} uid - ID del usuario (auth.uid)
 */
export const getUserData = async (uid) => {
  try {
    const ref = doc(db, "usuarios", uid); // asegúrate que tu colección se llama "usuarios"
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      throw new Error("Usuario no encontrado en Firestore");
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    throw error;
  }
};

/**
 * Guarda los datos del usuario al momento de registrarse
 * @param {string} uid
 * @param {object} data - {nombre, tipo, email}
 */
export const saveUserData = async (uid, data) => {
  try {
    await setDoc(doc(db, "usuarios", uid), data); // asegúrate de usar la misma colección
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    throw error;
  }
};
