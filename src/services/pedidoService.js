import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export const generarPedido = async (clienteId, carrito) => {
    const productos = carrito.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        empresaId: item.empresaId
    }));

    const empresas = [...new Set(productos.map((p) => p.empresaId))];

    await addDoc(collection(db, "pedidos"), {
        clienteId,
        empresas,
        estado: "pendiente",
        fecha: Timestamp.now(),
        productos
    });
};
