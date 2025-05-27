import { db } from "./firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, 
  doc, query, where, arrayUnion, arrayRemove, getDoc,
  writeBatch, serverTimestamp
} from "firebase/firestore";

const empresasCol = collection(db, "empresas");

export const getEmpresas = async () => {
  try {
    const snapshot = await getDocs(empresasCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    throw new Error("Error al cargar las empresas");
  }
};

export const getEmpresaById = async (id) => {
  try {
    const docRef = doc(db, "empresas", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Empresa no encontrada");
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    throw error;
  }
};

export const addEmpresa = async (empresaData) => {
  try {
    // Validar RUT único
    const q = query(empresasCol, where("rut", "==", empresaData.rut));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error("Ya existe una empresa con este RUT");
    }

    const docRef = await addDoc(empresasCol, {
      ...empresaData,
      productos: empresaData.manejaProductos ? [] : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...empresaData };
  } catch (error) {
    console.error("Error al crear empresa:", error);
    throw error;
  }
};

export const updateEmpresa = async (id, empresaData) => {
  try {
    const empresaRef = doc(db, "empresas", id);
    await updateDoc(empresaRef, {
      ...empresaData,
      updatedAt: serverTimestamp()
    });
    return id;
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    throw error;
  }
};

export const deleteEmpresa = async (id) => {
  try {
    // Primero eliminamos las referencias en los productos
    const empresa = await getEmpresaById(id);
    if (empresa.productos && empresa.productos.length > 0) {
      const batch = writeBatch(db);
      
      for (const productoId of empresa.productos) {
        const productoRef = doc(db, "productos", productoId);
        batch.update(productoRef, {
          empresas: arrayRemove(id),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    }
    
    // Luego eliminamos la empresa
    await deleteDoc(doc(db, "empresas", id));
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    throw error;
  }
};

export const getProductosByEmpresaId = async (empresaId) => {
  try {
    const empresa = await getEmpresaById(empresaId);
    if (!empresa.productos || empresa.productos.length === 0) return [];
    
    const productosPromises = empresa.productos.map(async productoId => {
      const productoDoc = await getDoc(doc(db, "productos", productoId));
      return productoDoc.exists() ? { id: productoDoc.id, ...productoDoc.data() } : null;
    });
    
    const productos = await Promise.all(productosPromises);
    return productos.filter(p => p !== null);
  } catch (error) {
    console.error("Error al obtener productos por empresa:", error);
    throw error;
  }
};

export const addProductoToEmpresa = async (empresaId, productoId) => {
  const batch = writeBatch(db);
  
  // Agregar producto a la empresa
  const empresaRef = doc(db, "empresas", empresaId);
  batch.update(empresaRef, {
    productos: arrayUnion(productoId),
    updatedAt: serverTimestamp()
  });
  
  // Agregar empresa al producto
  const productoRef = doc(db, "productos", productoId);
  batch.update(productoRef, {
    empresas: arrayUnion(empresaId),
    updatedAt: serverTimestamp()
  });
  
  try {
    await batch.commit();
  } catch (error) {
    console.error("Error al relacionar producto con empresa:", error);
    throw error;
  }
};

export const removeProductoFromEmpresa = async (empresaId, productoId) => {
  const batch = writeBatch(db);
  
  // Remover producto de la empresa
  const empresaRef = doc(db, "empresas", empresaId);
  batch.update(empresaRef, {
    productos: arrayRemove(productoId),
    updatedAt: serverTimestamp()
  });
  
  // Remover empresa del producto
  const productoRef = doc(db, "productos", productoId);
  batch.update(productoRef, {
    empresas: arrayRemove(empresaId),
    updatedAt: serverTimestamp()
  });
  
  try {
    await batch.commit();
  } catch (error) {
    console.error("Error al desvincular producto de empresa:", error);
    throw error;
  }
};