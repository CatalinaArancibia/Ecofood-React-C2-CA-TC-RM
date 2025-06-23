/*  PedidosEmpresa.jsx
    Cada empresa confirma o rechaza su parte del pedido.
    El pedido pasa a **en_proceso** solo cuando TODAS las empresas lo confirman
    y pasa a **cancelado** si cualquiera lo rechaza.                         */

import React, { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    runTransaction
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import PedidoCardEmpresa from "../../components/PedidoCardEmpresa";

/* ══════════════════════════════════════════════════════════════════════ */
/*                               Componente                              */
/* ══════════════════════════════════════════════════════════════════════ */
export default function PedidosEmpresa() {
    /* ---------- contexto usuario ---------- */
    const { user } = useAuth();

    /* ---------- estado UI ---------- */
    const [pedidos, setPedidos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [orden, setOrden] = useState("reciente");
    const [limite, setLimite] = useState(5);
    const [pagina, setPagina] = useState(1);
    const [scrollY, setScrollY] = useState(0);

    /* ---------- cargar pedidos que involucran a ESTA empresa ---------- */
    useEffect(() => {
        if (!user) return;
        const fetchPedidos = async () => {
            /* ←— consulta que cumple las reglas: solo pedidos donde
               el array “empresas” contiene el UID de la empresa logueada */
            const q = query(
                collection(db, "pedidos"),
                where("empresas", "array-contains", user.uid)
            );
            const snap = await getDocs(q);

            const lista = [];

            for (const d of snap.docs) {
                const raw = d.data();
                raw.id = d.id;

                /* productos que pertenecen únicamente a esta empresa */
                const prods = await Promise.all(
                    (raw.productos || []).map(async (p) => {
                        if (p.empresaId !== user.uid) return null;
                        const prodSnap = await getDoc(doc(db, "productos", p.productoId));
                        if (!prodSnap.exists()) return null;
                        return {
                            ...p,
                            nombreProducto: prodSnap.data().nombre,
                            cantidadDisponible: prodSnap.data().cantidad
                        };
                    })
                );

                const propios = prods.filter(Boolean);
                if (!propios.length) continue; // por seguridad

                lista.push({
                    ...raw,
                    productos: propios,
                    fecha: raw.fecha?.toDate?.() || new Date(),
                    miEstado: raw.confirmaciones?.[user.uid] || "pendiente"
                });
            }
            setPedidos(lista);
        };

        fetchPedidos();
    }, [user]);

    /* ---------- transacción de confirmar / rechazar ---------- */
    const procesarPedido = async (pedido, aprobar) => {
        const resp = await Swal.fire({
            title: aprobar ? "¿Confirmar pedido?" : "¿Rechazar pedido?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: aprobar ? "Confirmar" : "Rechazar",
            cancelButtonText: "Cancelar"
        });
        if (!resp.isConfirmed) return;

        try {
            await runTransaction(db, async (tx) => {
                /* 1. LEER pedido */
                const pedidoRef = doc(db, "pedidos", pedido.id);
                const snap = await tx.get(pedidoRef);
                if (!snap.exists()) throw new Error("El pedido ya no existe");

                const data = snap.data();
                const confirm = { ...(data.confirmaciones || {}) };
                confirm[user.uid] = aprobar ? "confirmado" : "cancelado";

                /* 2. Calcular nuevo estado global */
                let nuevoEstado = data.estado; // por defecto se mantiene
                if (Object.values(confirm).includes("cancelado")) {
                    nuevoEstado = "cancelado";
                } else if (data.empresas.every((e) => confirm[e] === "confirmado")) {
                    nuevoEstado = "en_proceso";
                } else {
                    nuevoEstado = "pendiente";
                }

                /* 3. Si esta empresa confirma → descontar stock de SUS productos */
                if (aprobar) {
                    for (const p of pedido.productos) {
                        const prodRef = doc(db, "productos", p.productoId);
                        const prodSnap = await tx.get(prodRef);
                        if (!prodSnap.exists()) continue;
                        const stockActual = prodSnap.data().cantidad;
                        const nuevoStock = stockActual - p.cantidad;
                        tx.update(prodRef, {
                            cantidad: nuevoStock,
                            estado: nuevoStock <= 0 ? "inactivo" : prodSnap.data().estado
                        });
                    }
                }

                /* 4. Actualizar confirmaciones y estado */
                tx.update(pedidoRef, {
                    confirmaciones: confirm,
                    estado: nuevoEstado
                });
            });

            Swal.fire(
                aprobar ? "Confirmado" : "Rechazado",
                aprobar
                    ? "Has confirmado tu parte del pedido"
                    : "Has rechazado tu parte del pedido",
                aprobar ? "success" : "info"
            );
            /* refrescar lista */
            setPedidos((prev) =>
                prev.map((p) =>
                    p.id === pedido.id
                        ? { ...p, miEstado: aprobar ? "confirmado" : "cancelado", estado: aprobar ? (p.estado === "pendiente" ? "pendiente" : p.estado) : "cancelado" }
                        : p
                )
            );
        } catch (e) {
            console.error(e);
            Swal.fire("Error", e.message, "error");
        }
    };

    /* ---------- filtros, orden, paginado ---------- */
    const filtrados = pedidos.filter(
        (p) =>
            p.productos.some((prod) =>
                prod.nombreProducto.toLowerCase().includes(busqueda.toLowerCase())
            ) && (filtroEstado ? p.estado === filtroEstado : true)
    );

    const ordenados = [...filtrados].sort((a, b) => {
        if (orden === "reciente") return b.fecha - a.fecha;
        if (orden === "antiguo") return a.fecha - b.fecha;
        if (orden === "estado") return a.estado.localeCompare(b.estado);
        return 0;
    });

    const totalPag = Math.ceil(ordenados.length / limite);
    const inicio = (pagina - 1) * limite;
    const visibles = ordenados.slice(inicio, inicio + limite);

    /* ---------- listener scroll para botón ↑ ---------- */
    useEffect(() => {
        const handle = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handle);
        return () => window.removeEventListener("scroll", handle);
    }, []);

    /* ════════════════════════ UI ════════════════════════ */
    return (
        <div className="container py-4">
            <h3 className="mb-4">📦 Pedidos recibidos</h3>

            {/*  filtros  */}
            <div className="row mb-3 align-items-end">
                <div className="col-md-3">
                    <label>Buscar por producto</label>
                    <input
                        className="form-control"
                        placeholder="Nombre del producto"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(1);
                        }}
                    />
                </div>

                <div className="col-md-3">
                    <label>Filtrar por estado</label>
                    <select
                        className="form-select"
                        value={filtroEstado}
                        onChange={(e) => {
                            setFiltroEstado(e.target.value);
                            setPagina(1);
                        }}
                    >
                        <option value="">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En proceso</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label>Ordenar por</label>
                    <select
                        className="form-select"
                        value={orden}
                        onChange={(e) => setOrden(e.target.value)}
                    >
                        <option value="reciente">Más reciente</option>
                        <option value="antiguo">Más antiguo</option>
                        <option value="estado">Estado</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label>Pedidos por página</label>
                    <select
                        className="form-select"
                        value={limite}
                        onChange={(e) => {
                            setLimite(+e.target.value);
                            setPagina(1);
                        }}
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                    </select>
                </div>
            </div>

            {/*  lista  */}
            {visibles.length ? (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {visibles.map((p) => (
                        <div key={p.id} className="col">
                            <PedidoCardEmpresa
                                pedido={p}
                                onConfirmar={() => procesarPedido(p, true)}
                                onRechazar={() => procesarPedido(p, false)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted">No hay pedidos que coincidan con la búsqueda.</p>
            )}

            {/*  paginación  */}
            {totalPag > 1 && (
                <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
                    <button
                        className="btn btn-outline-success"
                        disabled={pagina === 1}
                        onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                    >
                        ← Anterior
                    </button>

                    {Array.from({ length: totalPag }, (_, i) => (
                        <button
                            key={i}
                            className={`btn ${pagina === i + 1 ? "btn-success" : "btn-outline-success"
                                }`}
                            onClick={() => setPagina(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="btn btn-outline-success"
                        disabled={pagina === totalPag}
                        onClick={() => setPagina((p) => Math.min(p + 1, totalPag))}
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {/*  botón scroll-top  */}
            {scrollY > 100 && (
                <button
                    title="Volver arriba"
                    className="btn btn-success rounded-circle"
                    style={{
                        position: "fixed",
                        bottom: "30px",
                        right: "30px",
                        zIndex: 9999,
                        width: "50px",
                        height: "50px",
                        boxShadow: "0 2px 10px rgba(0,0,0,.3)"
                    }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    ↑
                </button>
            )}
        </div>
    );
}
