import React from "react";

/**
 *  Card que muestra la parte del pedido que compete a la empresa logueada.
 *  – Se muestran los botones **Confirmar / Rechazar** solo si la empresa
 *    todavía NO ha confirmado su porción del pedido (miEstado === "pendiente").
 *  – Una vez confirmada / rechazada, los botones desaparecen.
 *
 *  *props*
 *    ─ pedido: {
 *          estado:   "pendiente" | "en_proceso" | "cancelado" | "completado",
 *          miEstado: "pendiente" | "confirmado" | "cancelado",
 *          fecha,
 *          productos: [...]
 *      }
 *    ─ onConfirmar()
 *    ─ onRechazar()
 */
const PedidoCardEmpresa = ({ pedido, onConfirmar, onRechazar }) => {
    /* ---------- datos básicos ---------- */
    const fecha = pedido.fecha?.toLocaleDateString?.() || "Sin fecha";
    const hora = pedido.fecha?.toLocaleTimeString?.() || "";
    const estadoGlobal = pedido.estado;
    const miEstado = pedido.miEstado || "pendiente";

    /* ---------- helpers visuales ---------- */
    const estadoColor = {
        pendiente: "info",
        en_proceso: "warning",
        completado: "success",
        cancelado: "danger"
    }[estadoGlobal] || "secondary";

    const estadoIcono = {
        pendiente: "⏳",
        en_proceso: "🔄",
        completado: "✅",
        cancelado: "❌"
    }[estadoGlobal] || "ℹ️";

    const estadoNombre = {
        pendiente: "Pendiente",
        en_proceso: "En proceso",
        completado: "Completado",
        cancelado: "Cancelado"
    }[estadoGlobal] || estadoGlobal;

    /* ---------- render ---------- */
    return (
        <div className="card h-100 shadow-sm border">
            <div className="card-body d-flex flex-column">
                {/* cabecera */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">
                        Estado:{" "}
                        <span className={`badge bg-${estadoColor}`}>
                            {estadoIcono} {estadoNombre}
                        </span>
                    </h5>
                    <small className="text-muted">
                        <strong>Fecha:</strong> {fecha} {hora}
                    </small>
                </div>

                {/* lista de productos de ESTA empresa */}
                <ul className="list-group list-group-flush mb-3">
                    {pedido.productos.map((prod, idx) => (
                        <li
                            key={idx}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <strong>{prod.nombreProducto}</strong>
                                <br />
                                <small className="text-muted">
                                    Solicitado: {prod.cantidad} / Stock actual:{" "}
                                    {prod.cantidadDisponible}
                                </small>
                            </div>
                            <span className="badge bg-secondary">{prod.cantidad} u.</span>
                        </li>
                    ))}
                </ul>

                {/* botones: SOLO si la empresa aún no ha confirmado su parte */}
                {miEstado === "pendiente" && (
                    <div className="mt-auto d-flex justify-content-between">
                        {/* Confirmar a la izquierda  ──────────────── */}
                        <button className="btn btn-success btn-sm" onClick={onConfirmar}>
                            ✅ Confirmar
                        </button>

                        {/* Rechazar a la derecha  ───────────────── */}
                        <button className="btn btn-danger btn-sm" onClick={onRechazar}>
                            ❌ Rechazar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PedidoCardEmpresa;
