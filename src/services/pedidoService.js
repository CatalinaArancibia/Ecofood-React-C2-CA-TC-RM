import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Genera un pedido a partir del carrito.
 *  - carrito: [{ id, cantidad, empresaId, ... }]
 *  - Se crean los campos:
 *      empresas        : [uidEmpresa, ...]
 *      confirmaciones  : { uidEmpresa: "pendiente", ... }
 *      estado          : "pendiente"
 */
export const generarPedido = async (clienteId, carrito) => {
    if (!carrito.length) throw new Error("El carrito está vacío");

    /* ─── 1. Estructurar productos ─── */
    const productos = carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        empresaId: item.empresaId
    }));

    /* ─── 2. Empresas únicas ─── */
    const empresas = Array.from(new Set(productos.map(p => p.empresaId)));

    /* ─── 3. Mapa confirmaciones ─── */
    const confirmaciones = empresas.reduce((acc, uid) => {
        acc[uid] = "pendiente";
        return acc;
    }, {});

    /* ─── 4. Guardar pedido ─── */
    await addDoc(collection(db, "pedidos"), {
        clienteId,
        empresas,
        confirmaciones,
        estado: "pendiente",
        fecha: Timestamp.now(),
        productos
    });
};

