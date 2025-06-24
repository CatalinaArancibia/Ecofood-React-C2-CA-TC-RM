import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const usuariosCol = collection(db, "usuarios");

/* ─────────────────────  HELPERS COMUNES  ───────────────────── */

/** ¿Existe YA un administrador principal (opcionalmente excluyendo un id)? */
const existeAdminPrincipal = async (excludeId = null) => {
  const q = query(
    usuariosCol,
    where("tipo", "==", "admin"),
    where("tipoAdmin", "==", "principal")
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => (excludeId ? d.id !== excludeId : true));
};

/**
 * Comprueba duplicados de RUT / correo / teléfono.
 * Lanza Error si encuentra alguno.
 * @param {object} campos   { rut?, correo?, telefono? }
 * @param {string|null} id  id a excluir (modo edición)
 */
export const validateUniqueFields = async (campos, id = null) => {
  const checks = [
    ["rut", campos.rut],
    ["correo", campos.correo],
    ["telefono", campos.telefono],
  ];

  for (const [campo, valor] of checks) {
    if (!valor) continue;
    const q = query(
      usuariosCol,
      where(campo, "==", valor),
      ...(id ? [where("__name__", "!=", id)] : [])
    );
    if (!(await getDocs(q)).empty) {
      throw new Error(`El ${campo} ya está registrado`);
    }
  }
};

/* ─────────────────────  LECTURAS  ───────────────────── */

export const getAdmins = async () => {
  const q = query(usuariosCol, where("tipo", "==", "admin"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getNonAdminUsers = async () => {
  const q = query(usuariosCol, where("tipo", "==", "cliente"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ─────────────────────  CREAR ADMIN  ───────────────────── */

export const addAdmin = async (uid, data) => {
  if (!uid) throw new Error("Falta UID del usuario");
  if (!data.nombre?.trim()) throw new Error("Nombre es obligatorio");
  if (!data.rut?.trim()) throw new Error("RUT es obligatorio");

  // 1· Duplicados globales
  await validateUniqueFields(data);

  // 2· Único admin principal
  if (data.tipoAdmin === "principal" && (await existeAdminPrincipal()))
    throw new Error("Ya existe un administrador principal");

  // 3· Guardar
  await setDoc(doc(db, "usuarios", uid), {
    ...data,
    uid,
    tipo: "admin",
    createdAt: new Date(),
  });
  return uid;
};

/* ─────────────────────  PROMOVER CLIENTE → ADMIN  ───────────────────── */

export const promoteUserToAdmin = async (uid, data) => {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Usuario no encontrado");
  if (snap.data().tipo !== "cliente")
    throw new Error("Solo se pueden promover clientes");

  // Validar unicidad excluyendo el propio documento
  await validateUniqueFields(data, uid);

  await updateDoc(ref, {
    ...data,
    tipo: "admin",
    tipoAdmin: data.tipoAdmin || "secundario",
    promotedAt: new Date(),
  });
};

/* ─────────────────────  ACTUALIZAR ADMIN  ───────────────────── */

export const updateAdmin = async (id, data, currentUid) => {
  const ref = doc(db, "usuarios", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Administrador no encontrado");

  const anterior = snap.data();

  /* reglas sobre el admin principal */
  if (anterior.tipoAdmin === "principal" && id !== currentUid)
    throw new Error("Solo el administrador principal puede editar su perfil");

  if (data.tipoAdmin === "principal" && anterior.tipoAdmin !== "principal")
    if (await existeAdminPrincipal(id))
      throw new Error("Ya existe un administrador principal");

  // Validar unicidad excluyendo mi propio doc
  await validateUniqueFields(data, id);

  await updateDoc(ref, { ...data, updatedAt: new Date() });
};

/* ─────────────────────  DEGRADAR A CLIENTE  ───────────────────── */

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
    demotedAt: new Date(),
  });
};
