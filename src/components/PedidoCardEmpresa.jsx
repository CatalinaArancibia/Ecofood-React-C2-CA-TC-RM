import React from "react";

const PedidoCardEmpresa = ({ pedido, onConfirmar, onRechazar }) => {
    const fecha = pedido.fecha?.toLocaleDateString?.() || "Sin fecha";
    const hora = pedido.fecha?.toLocaleTimeString?.() || "";
    const estado = pedido.estado;

    const estadoColor = {
        pendiente: "info",
        en_proceso: "warning",
        completado: "success",
        cancelado: "danger",
    }[estado] || "secondary";

    const estadoIcono = {
        pendiente: "⏳",
        en_proceso: "🔄",
        completado: "✅",
        cancelado: "❌",
    }[estado] || "ℹ️";

    const estadoNombre = {
        pendiente: "Pendiente",
        en_proceso: "En proceso",
        completado: "Completado",
        cancelado: "Cancelado",
    }[estado] || estado;

    return (
        <div className="card h-100 shadow-sm border">
            <div className="card-body d-flex flex-column">
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
                                    Solicitado: {prod.cantidad} / Stock actual: {prod.cantidadDisponible}
                                </small>
                            </div>
                            <span className="badge bg-secondary">
                                {prod.cantidad} u.
                            </span>
                        </li>
                    ))}
                </ul>

                {estado === "pendiente" && (
                    <div className="mt-auto d-flex justify-content-between">
                        <button className="btn btn-success btn-sm" onClick={onConfirmar}>
                            ✅ Confirmar
                        </button>
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

