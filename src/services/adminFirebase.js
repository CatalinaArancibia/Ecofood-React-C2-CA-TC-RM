import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";

// Función auxiliar para verificar si existe un admin principal
const existeAdminPrincipal = async (excludeId = null) => {
  let q = query(
    collection(db, "usuarios"),
    where("tipo", "==", "admin"),
    where("tipoAdmin", "==", "principal")
  );

  const snapshot = await getDocs(q);

  if (excludeId) {
    return snapshot.docs.some(
      (doc) => doc.id !== excludeId && doc.data().tipoAdmin === "principal"
    );
  }

  return !snapshot.empty;
};

// Obtener todos los administradores
export const getAdmins = async () => {
  const q = query(collection(db, "usuarios"), where("tipo", "==", "admin"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Obtener usuarios no administradores
export const getNonAdminUsers = async () => {
  const q = query(collection(db, "usuarios"), where("tipo", "!=", "admin"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Crear nuevo administrador
export const addAdmin = async (adminData) => {
  if (!adminData.nombre.trim()) {
    throw new Error("Nombre es obligatorio");
  }

  if (!adminData.rut.trim()) {
    throw new Error("RUT es obligatorio");
  }

  if (adminData.tipoAdmin === "principal") {
    const existePrincipal = await existeAdminPrincipal();
    if (existePrincipal) {
      throw new Error("Ya existe un administrador principal");
    }
  }

  try {
    const docRef = await addDoc(collection(db, "usuarios"), {
      ...adminData,
      tipo: "admin",
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar administrador:", error);
    throw error;
  }
};

// Promover usuario existente a administrador
export const promoteUserToAdmin = async (userId, adminData) => {
  const userRef = doc(db, "usuarios", userId);

  try {
    // Primero verificamos que el usuario exista
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }

    // Actualizamos el documento existente
    await updateDoc(userRef, {
      ...adminData,
      tipo: "admin", // Esto cambia el tipo a administrador
      tipoAdmin: "secundario", // Asignamos el tipo de admin
      promotedAt: new Date(), // Marcamos la fecha de promoción
    });

    return userId;
  } catch (error) {
    console.error("Error al promover usuario:", error);
    throw error;
  }
};

// Actualizar administrador
export const updateAdmin = async (id, adminData, currentUserId) => {
  const adminRef = doc(db, "usuarios", id);
  const adminDoc = await getDoc(adminRef);

  if (!adminDoc.exists()) {
    throw new Error("Administrador no encontrado");
  }

  const adminActual = adminDoc.data();

  if (adminActual.tipoAdmin === "principal") {
    if (adminData.tipoAdmin !== "principal") {
      throw new Error("No se puede quitar el rol de administrador principal");
    }

    if (id !== currentUserId) {
      throw new Error(
        "Solo el administrador principal puede editar su propia cuenta"
      );
    }
  }

  if (
    adminData.tipoAdmin === "principal" &&
    adminActual.tipoAdmin !== "principal"
  ) {
    const existePrincipal = await existeAdminPrincipal(id);
    if (existePrincipal) {
      throw new Error("Ya existe un administrador principal");
    }
  }

  await updateDoc(adminRef, adminData);
  return id;
};

// Eliminar administrador (solo de Firestore, no de Firebase Auth)
export const deleteAdmin = async (id, currentUserId) => {
  const adminRef = doc(db, "usuarios", id);
  const adminDoc = await getDoc(adminRef);

  if (!adminDoc.exists()) {
    throw new Error("Administrador no encontrado");
  }

  const adminData = adminDoc.data();

  if (adminData.tipoAdmin === "principal") {
    throw new Error("No se puede eliminar al administrador principal");
  }

  if (id === currentUserId) {
    throw new Error("No puedes eliminarte a ti mismo");
  }

  try {
    // Solo eliminamos el documento en Firestore
    await deleteDoc(adminRef);

    // Si luego quieres borrar desde backend, deberías hacerlo con una Cloud Function

    return id;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};
