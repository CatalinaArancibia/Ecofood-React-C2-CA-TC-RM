// src/services/clientesService.js

import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const usuariosCol = collection(db, "usuarios");

/* ---------- helpers ---------- */
const existeDuplicado = async (campo, valor, excludeId = null) => {
  if (!valor) return false;
  const q = query(usuariosCol, where(campo, "==", valor));
  const snap = await getDocs(q);
  return snap.docs.some(d => (excludeId ? d.id !== excludeId : true));
};

/* ---------- validación previa (crear) ---------- */
export const verificarDuplicadosCliente = async ({ rut, correo, telefono }) => {
  if (await existeDuplicado("rut", rut))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("correo", correo))
    throw new Error("El correo ya está registrado");
  if (await existeDuplicado("telefono", telefono))
    throw new Error("El teléfono ya está registrado");
};

/* ---------- validación previa (editar) ---------- */
export const verificarDuplicadosClienteEdicion = async (id, { rut, correo, telefono }) => {
  if (await existeDuplicado("rut", rut, id))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("correo", correo, id))
    throw new Error("El correo ya está registrado");
  if (await existeDuplicado("telefono", telefono, id))
    throw new Error("El teléfono ya está registrado");
};

/* ---------- CRUD ---------- */
export const addCliente = async (uid, data) => {
  await setDoc(doc(db, "usuarios", uid), {
    ...data,
    uid,
    tipo: "cliente",
    createdAt: new Date()
  });
  return uid;
};

export const updateCliente = async (id, data) => {
  await verificarDuplicadosClienteEdicion(id, data);
  await updateDoc(doc(db, "usuarios", id), {
    ...data,
    updatedAt: new Date()
  });
  return id;
};

export const deleteCliente = async (id) => {
  // Hard delete: borra el documento de Firestore
  await deleteDoc(doc(db, "usuarios", id));
};

/* ---------- lecturas ---------- */
export const getClientes = async () => {
  const q = query(usuariosCol, where("tipo", "==", "cliente"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
