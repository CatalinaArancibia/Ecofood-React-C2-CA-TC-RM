import { db } from "./firebase";
import {
  collection, getDocs, setDoc, updateDoc, deleteDoc,
  doc, query, where, getDoc, serverTimestamp
} from "firebase/firestore";

/* referencia a la colección de todos los usuarios */
const usuariosCol = collection(db, "usuarios");

/* ─────────────────────── Lectura ─────────────────────── */
export const getClientes = async () => {
  const q = query(usuariosCol, where("tipo", "==", "cliente"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getClienteById = async (id) => {
  const ref = doc(db, "usuarios", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Cliente no encontrado");
  return { id: snap.id, ...snap.data() };
};

/* ─────────── helper: e-mail único ─────────── */
const emailYaExiste = async (email, excluirId = null) => {
  if (!email) return false;
  let q = query(
    usuariosCol,
    where("tipo", "==", "cliente"),
    where("correo", "==", email)
  );
  if (excluirId) q = query(q, where("__name__", "!=", excluirId));
  const snap = await getDocs(q);
  return !snap.empty;
};

/* ─────────────────────── Crear ─────────────────────── */
/**
 * @param {string} uid   UID del usuario creado en Firebase Auth
 * @param {object} data  Datos del cliente (nombre, rut, etc.)
 */
export const addCliente = async (uid, data) => {
  if (await emailYaExiste(data.correo)) {
    throw new Error("El correo ya está registrado");
  }

  await setDoc(doc(db, "usuarios", uid), {
    ...data,
    tipo: "cliente",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return uid;
};

/* ─────────────────────── Actualizar ─────────────────────── */
export const updateCliente = async (id, data) => {
  if (data.correo && await emailYaExiste(data.correo, id)) {
    throw new Error("El correo ya está registrado en otro cliente");
  }

  await updateDoc(doc(db, "usuarios", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
  return id;
};

/* ─────────────────────── Eliminar ─────────────────────── */
export const deleteCliente = async (id) => {
  await deleteDoc(doc(db, "usuarios", id));
};
