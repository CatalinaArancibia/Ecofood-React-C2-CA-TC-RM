import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";

// Obtener todos los clientes
export const getClientes = async () => {
  const q = query(collection(db, "usuarios"), where("tipo", "==", "cliente"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Verificar si un email existe en los clientes
export const verificarEmailCliente = async (email) => {
  if (!email) return false;
  
  const q = query(
    collection(db, "usuarios"),
    where("tipo", "==", "cliente"),
    where("email", "==", email)
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Crear un nuevo cliente
export const addCliente = async (clienteData) => {
  // Verificar si el email ya existe
  if (clienteData.email) {
    const existe = await verificarEmailCliente(clienteData.email);
    if (existe) {
      throw new Error("El email ya está registrado");
    }
  }

  const docRef = await addDoc(collection(db, "usuarios"), {
    ...clienteData,
    tipo: "cliente"
  });
  return docRef.id;
};

// Actualizar un cliente existente
export const updateCliente = async (id, clienteData) => {
  // Verificar si el email ya existe en otro cliente
  if (clienteData.email) {
    const q = query(
      collection(db, "usuarios"),
      where("tipo", "==", "cliente"),
      where("email", "==", clienteData.email),
      where("__name__", "!=", id)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("El email ya está registrado en otro cliente");
    }
  }

  const clienteRef = doc(db, "usuarios", id);
  await updateDoc(clienteRef, clienteData);
  return id;
};

// Eliminar cliente 
export const deleteCliente = async (id) => {
  await deleteDoc(doc(db, "usuarios", id));
};