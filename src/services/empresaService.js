import { db } from "./firebase";
import {
  collection, getDocs, setDoc, updateDoc, deleteDoc,
  doc, query, where, arrayUnion, arrayRemove, getDoc,
  writeBatch, serverTimestamp
} from "firebase/firestore";

/* ──────────────────────────── Colección ──────────────────────────── */
const empresasCol = collection(db, "usuarios");

/* ──────────────────────────── Helpers ──────────────────────────── */
const existeDuplicado = async (campo, valor, excludeId = null) => {
  if (!valor) return false;
  const q = query(empresasCol, where(campo, "==", valor));
  const snap = await getDocs(q);
  return snap.docs.some(d => (excludeId ? d.id !== excludeId : true));
};

/* ─────────── Validación previa (crear) ─────────── */
export const verificarDuplicadosEmpresa = async ({ rut, email, telefono }) => {
  if (await existeDuplicado("rut", rut))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("telefono", telefono))
    throw new Error("El teléfono ya está registrado");
  if (await existeDuplicado("email", email))
    throw new Error("El correo ya está registrado");
};

/* ─────────── Validación previa (editar) ─────────── */
export const verificarDuplicadosEmpresaEdicion = async (
  id,
  { rut, email, telefono }
) => {
  if (await existeDuplicado("rut", rut, id))
    throw new Error("El RUT ya está registrado");
  if (await existeDuplicado("telefono", telefono, id))
    throw new Error("El teléfono ya está registrado");
  if (await existeDuplicado("email", email, id))
    throw new Error("El correo ya está registrado");
};

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
 * La validación de duplicados **debe** hacerse antes de llamar a esta función.
 */
export const addEmpresa = async (uid, data) => {
  await setDoc(doc(db, "usuarios", uid), {
    ...data,
    productos: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return uid;
};

/* ──────────────────────────── Actualizar ──────────────────────────── */
export const updateEmpresa = async (id, data) => {
  await verificarDuplicadosEmpresaEdicion(id, data);
  await updateDoc(doc(db, "usuarios", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
  return id;
};

/* ──────────────────────────── Eliminar ──────────────────────────── */
export const deleteEmpresa = async (id) => {
  // ① Traemos la empresa
  const empresa = await getEmpresaById(id);

  // ② Nos aseguramos de tener un array REAL de strings no vacíos
  const productosValidos = Array.isArray(empresa.productos)
    ? empresa.productos.filter(pid => typeof pid === "string" && pid.trim().length)
    : [];

  // ③ Si hay productos válidos, preparamos el batch
  if (productosValidos.length) {
    const batch = writeBatch(db);
    let writes = 0;

    for (const pid of productosValidos) {
      const prodRef = doc(db, "productos", pid);
      const prodSnap = await getDoc(prodRef);
      if (!prodSnap.exists()) continue;   // saltamos IDs fantasma

      batch.update(prodRef, {
        empresas: arrayRemove(id),
        updatedAt: serverTimestamp()
      });
      writes++;
    }

    // 🚨 SOLO enviamos el batch si realmente agregamos alguna escritura
    if (writes > 0) {
      await batch.commit();
    }
  }

  // ④ Finalmente, borramos la empresa (esto NUNCA lanza 400)
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
