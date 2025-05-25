import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const adminsCol = collection(db, "administradores");

// Obtener todos los admins
export const getAdmins = async () => {
  const q = query(adminsCol);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Crear admin
export const createAdmin = async (admin) => {
  return await addDoc(adminsCol, admin);
};

// Actualizar admin
export const updateAdmin = async (id, updatedAdmin) => {
  const adminDoc = doc(db, "administradores", id);
  return await updateDoc(adminDoc, updatedAdmin);
};

// Eliminar admin con validación para no borrar admin principal
export const deleteAdmin = async (id, adminsList) => {
  const admin = adminsList.find(a => a.id === id);
  if (admin && admin.tipo === "principal") {
    throw new Error("No se puede eliminar el administrador principal");
  }
  const adminDoc = doc(db, "administradores", id);
  return await deleteDoc(adminDoc);
};