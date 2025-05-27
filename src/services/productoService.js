import { db } from "./firebase";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, 
  doc, query, where, arrayUnion, arrayRemove, getDoc,
  writeBatch, serverTimestamp
} from "firebase/firestore";

const productosCol = collection(db, "productos");

export const getProductos = async () => {
  try {
    const snapshot = await getDocs(productosCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("Error al cargar los productos");
  }
};

export const getProductoById = async (id) => {
  try {
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Producto no encontrado");
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }
};

export const addProducto = async (productoData) => {
  try {
    // Validar nombre único
    const q = query(productosCol, where("nombre", "==", productoData.nombre));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error("Ya existe un producto con este nombre");
    }

    const docRef = await addDoc(productosCol, {
      ...productoData,
      empresas: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...productoData };
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, {
      ...productoData,
      updatedAt: serverTimestamp()
    });
    return id;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const deleteProducto = async (id) => {
  try {
    // Primero eliminamos las referencias en las empresas
    const producto = await getProductoById(id);
    if (producto.empresas && producto.empresas.length > 0) {
      const batch = writeBatch(db);
      
      for (const empresaId of producto.empresas) {
        const empresaRef = doc(db, "empresas", empresaId);
        batch.update(empresaRef, {
          productos: arrayRemove(id),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    }
    
    // Luego eliminamos el producto
    await deleteDoc(doc(db, "productos", id));
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};

export const getEmpresasByProductoId = async (productoId) => {
  try {
    const producto = await getProductoById(productoId);
    if (!producto.empresas || producto.empresas.length === 0) return [];
    
    const empresasPromises = producto.empresas.map(async empresaId => {
      const empresaDoc = await getDoc(doc(db, "empresas", empresaId));
      return empresaDoc.exists() ? { id: empresaDoc.id, ...empresaDoc.data() } : null;
    });
    
    const empresas = await Promise.all(empresasPromises);
    return empresas.filter(e => e !== null);
  } catch (error) {
    console.error("Error al obtener empresas por producto:", error);
    throw error;
  }
};

export const addEmpresaToProducto = async (productoId, empresaId) => {
  const batch = writeBatch(db);
  
  // Agregar empresa al producto
  const productoRef = doc(db, "productos", productoId);
  batch.update(productoRef, {
    empresas: arrayUnion(empresaId),
    updatedAt: serverTimestamp()
  });
  
  // Agregar producto a la empresa
  const empresaRef = doc(db, "empresas", empresaId);
  batch.update(empresaRef, {
    productos: arrayUnion(productoId),
    updatedAt: serverTimestamp()
  });
  
  try {
    await batch.commit();
  } catch (error) {
    console.error("Error al relacionar empresa con producto:", error);
    throw error;
  }
};

export const removeEmpresaFromProducto = async (productoId, empresaId) => {
  const batch = writeBatch(db);
  
  // Remover empresa del producto
  const productoRef = doc(db, "productos", productoId);
  batch.update(productoRef, {
    empresas: arrayRemove(empresaId),
    updatedAt: serverTimestamp()
  });
  
  // Remover producto de la empresa
  const empresaRef = doc(db, "empresas", empresaId);
  batch.update(empresaRef, {
    productos: arrayRemove(productoId),
    updatedAt: serverTimestamp()
  });
  
  try {
    await batch.commit();
  } catch (error) {
    console.error("Error al desvincular empresa de producto:", error);
    throw error;
  }
};