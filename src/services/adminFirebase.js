import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc
} from "firebase/firestore";

/* ───────── helpers comunes ───────── */

/** Comprueba si existe YA un admin principal (opcionalmente excluyendo un id). */
const existeAdminPrincipal = async (excludeId = null) => {
  const q = query(
    collection(db, "usuarios"),
    where("tipo", "==", "admin"),
    where("tipoAdmin", "==", "principal")
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => (excludeId ? d.id !== excludeId : true));
};

/** Comprueba duplicidad de RUT / correo / teléfono entre administradores. */
const existeDuplicado = async (campo, valor, excludeId = null) => {
  if (!valor) return false;
  const q = query(
    collection(db, "usuarios"),
    where("tipo", "==", "admin"),
    where(campo, "==", valor)
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => (excludeId ? d.id !== excludeId : true));
};

/* ───────── lecturas ───────── */

export const getAdmins = async () => {
  const q = query(collection(db, "usuarios"), where("tipo", "==", "admin"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Clientes (y cualquier user no admin) → para “promover” */
export const getNonAdminUsers = async () => {
  const q = query(collection(db, "usuarios"), where("tipo", "in", ["cliente"]));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ───────── creación ─────────
   uid     → UID del usuario que acabamos de crear en Firebase Auth
   data    → resto de campos del formulario                            */
export const addAdmin = async (uid, data) => {
  if (!uid) throw new Error("Falta UID del usuario");
  if (!data.nombre?.trim()) throw new Error("Nombre es obligatorio");
  if (!data.rut?.trim()) throw new Error("RUT es obligatorio");

  /* duplicados */
  if (await existeDuplicado("rut", data.rut))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("correo", data.correo))
    throw new Error("El correo ya está registrado");
  if (await existeDuplicado("telefono", data.telefono))
    throw new Error("El teléfono ya está registrado");

  /* único admin principal */
  if (data.tipoAdmin === "principal" && (await existeAdminPrincipal()))
    throw new Error("Ya existe un administrador principal");

  /* guardamos con id = uid  */
  await setDoc(doc(db, "usuarios", uid), {
    ...data,
    uid,
    tipo: "admin",
    createdAt: new Date()
  });
  return uid;
};

/* ───────── promoción cliente → admin ───────── */
export const promoteUserToAdmin = async (uid, data) => {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Usuario no encontrado");

  /* solo clientes */
  if (snap.data().tipo !== "cliente")
    throw new Error("Solo se pueden promover clientes");

  /* duplicados de campos  */
  if (await existeDuplicado("rut", data.rut, uid))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("telefono", data.telefono, uid))
    throw new Error("El teléfono ya está registrado");

  await updateDoc(ref, {
    ...data,
    tipo: "admin",
    tipoAdmin: data.tipoAdmin || "secundario",
    promotedAt: new Date()
  });
};

/* ───────── actualización ───────── */
export const updateAdmin = async (id, data, currentUid) => {
  const ref = doc(db, "usuarios", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Administrador no encontrado");

  const prev = snap.data();

  /* reglas sobre principal */
  if (prev.tipoAdmin === "principal" && id !== currentUid)
    throw new Error("Solo el administrador principal puede editar su perfil");

  if (data.tipoAdmin === "principal" && prev.tipoAdmin !== "principal") {
    if (await existeAdminPrincipal(id))
      throw new Error("Ya existe un administrador principal");
  }

  /* duplicados (excepto mi propio doc) */
  if (await existeDuplicado("rut", data.rut, id))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("correo", data.correo, id))
    throw new Error("El correo ya está registrado");
  if (await existeDuplicado("telefono", data.telefono, id))
    throw new Error("El teléfono ya está registrado");

  await updateDoc(ref, { ...data, updatedAt: new Date() });
};

/* ───────── “Eliminar” = degradar a cliente ───────── */
export const deleteAdmin = async (id, currentUid) => {
  if (id === currentUid) throw new Error("No puedes eliminarte a ti mismo");

  const ref = doc(db, "usuarios", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Administrador no encontrado");

  if (snap.data().tipoAdmin === "principal")
    throw new Error("No se puede eliminar al administrador principal");

  await updateDoc(ref, {
    tipo: "cliente",
    tipoAdmin: null,
    demotedAt: new Date()
  });
};
