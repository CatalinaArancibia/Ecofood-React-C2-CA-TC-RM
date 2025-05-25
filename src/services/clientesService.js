import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

const clientesRef = collection(db, "clientes");

export const obtenerClientes = async () => {
  const snapshot = await getDocs(clientesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const agregarCliente = async (cliente) => {
  const docRef = await addDoc(clientesRef, cliente);
  return docRef.id;
};

export const actualizarCliente = async (id, cliente) => {
  const clienteDoc = doc(db, "clientes", id);
  await updateDoc(clienteDoc, cliente);
};

export const eliminarCliente = async (id) => {
  const clienteDoc = doc(db, "clientes", id);
  await deleteDoc(clienteDoc);
};