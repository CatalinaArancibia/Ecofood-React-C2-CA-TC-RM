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
  getDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Función auxiliar para verificar si existe un admin principal
const existeAdminPrincipal = async (excludeId = null) => {
  let q = query(
    collection(db, "usuarios"),
    where("tipo", "==", "admin"),
    where("tipoAdmin", "==", "principal")
  );

  const snapshot = await getDocs(q);
  
  if (excludeId) {
    return snapshot.docs.some(doc => doc.id !== excludeId && doc.data().tipoAdmin === "principal");
  }
  
  return !snapshot.empty;
};

// Obtener todos los administradores
export const getAdmins = async () => {
  const q = query(collection(db, "usuarios"), where("tipo", "==", "admin"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener usuarios promovibles (clientes y otros admins)
export const getNonAdminUsers = async () => {
  const q = query(
    collection(db, "usuarios"),
    where("tipo", "in", ["cliente", "admin"])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      createdAt: new Date()
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
    // Verificar que el usuario exista y sea promovible
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }

    const userData = userDoc.data();
    
    // Solo permitir promover clientes y otros admins
    if (!["cliente", "admin"].includes(userData.tipo)) {
      throw new Error("Solo se pueden promover clientes y administradores");
    }

    // Actualizar el documento
    await updateDoc(userRef, {
      ...adminData,
      tipo: "admin",
      tipoAdmin: adminData.tipoAdmin || "secundario",
      promotedAt: new Date()
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
      throw new Error("Solo el administrador principal puede editar su propia cuenta");
    }
  }

  if (adminData.tipoAdmin === "principal" && adminActual.tipoAdmin !== "principal") {
    const existePrincipal = await existeAdminPrincipal(id);
    if (existePrincipal) {
      throw new Error("Ya existe un administrador principal");
    }
  }

  await updateDoc(adminRef, adminData);
  return id;
};

// "Eliminar" administrador (convertir a cliente)
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
    // Convertir a cliente en lugar de eliminar
    await updateDoc(adminRef, {
      tipo: "cliente",
      tipoAdmin: null,
      demotedAt: new Date()
    });
    
    return id;
  } catch (error) {
    console.error("Error al convertir administrador a cliente:", error);
    throw error;
  }
};