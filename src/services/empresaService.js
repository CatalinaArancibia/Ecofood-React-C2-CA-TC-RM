import { db } from "./firebase";
import {
  collection, getDocs, setDoc, updateDoc, deleteDoc,
  doc, query, where, arrayUnion, arrayRemove, getDoc,
  writeBatch, serverTimestamp
} from "firebase/firestore";

/* Todas las empresas residen en la colección ‘usuarios’ */
const empresasCol = collection(db, "usuarios");

/* ──────────────────────────── Lectura ──────────────────────────── */
export const getEmpresas = async () => {
  const snap = await getDocs(empresasCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getEmpresaById = async (id) => {
  const ref = doc(db, "usuarios", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Empresa no encontrada");
  return { id: snap.id, ...snap.data() };
};

/* ──────────────────────────── Crear ──────────────────────────── */
/**
 * Crea un documento con el mismo UID que devuelve Firebase Auth.
 * @param {string} uid   UID del usuario recién creado en Auth
 * @param {object} data  Datos de la empresa (nombre, rut, etc.)
 */
export const addEmpresa = async (uid, data) => {
  /* Validar RUT único */
  const q = query(empresasCol, where("rut", "==", data.rut));
  if (!(await getDocs(q)).empty) {
    throw new Error("Ya existe una empresa con este RUT");
  }

  await setDoc(doc(db, "usuarios", uid), {
    ...data,                 // NO se guarda idAuth
    productos: [],           // siempre array
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return uid;                // devolvemos el mismo UID
};

/* ──────────────────────────── Actualizar ──────────────────────────── */
export const updateEmpresa = async (id, data) => {
  await updateDoc(doc(db, "usuarios", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
  return id;
};

/* ──────────────────────────── Eliminar ──────────────────────────── */
export const deleteEmpresa = async (id) => {
  /* 1. Quitar referencias en productos */
  const empresa = await getEmpresaById(id);
  if (empresa.productos?.length) {
    const batch = writeBatch(db);
    empresa.productos.forEach(pid => {
      batch.update(doc(db, "productos", pid), {
        empresas: arrayRemove(id),
        updatedAt: serverTimestamp()
      });
    });
    await batch.commit();
  }
  /* 2. Borrar la empresa */
  await deleteDoc(doc(db, "usuarios", id));
};

/* ──────────────────────────── Productos por empresa ──────────────────────────── */
export const getProductosByEmpresaId = async (empresaId) => {
  const empresa = await getEmpresaById(empresaId);
  if (!empresa.productos?.length) return [];

  const promesas = empresa.productos.map(async pid => {
    const snap = await getDoc(doc(db, "productos", pid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  });

  return (await Promise.all(promesas)).filter(Boolean);
};

/* ──────────────────────────── Relacionar producto <-> empresa ──────────────────────────── */
export const addProductoToEmpresa = async (empresaId, productoId) => {
  const batch = writeBatch(db);

  batch.update(doc(db, "usuarios", empresaId), {
    productos: arrayUnion(productoId),
    updatedAt: serverTimestamp()
  });

  batch.update(doc(db, "productos", productoId), {
    empresas: arrayUnion(empresaId),
    updatedAt: serverTimestamp()
  });

  await batch.commit();
};

export const removeProductoFromEmpresa = async (empresaId, productoId) => {
  const batch = writeBatch(db);

  batch.update(doc(db, "usuarios", empresaId), {
    productos: arrayRemove(productoId),
    updatedAt: serverTimestamp()
  });

  batch.update(doc(db, "productos", productoId), {
    empresas: arrayRemove(empresaId),
    updatedAt: serverTimestamp()
  });

  await batch.commit();
};
