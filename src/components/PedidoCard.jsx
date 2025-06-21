import React from "react";

const PedidoCard = ({ pedido, onCancelar }) => {
    const fecha = pedido.fecha?.toLocaleDateString?.() || "Sin fecha";
    const hora = pedido.fecha?.toLocaleTimeString?.() || "";
    const estado = pedido.estado;

    const estadoColor = {
        pendiente: "info",
        completado: "success",
        cancelado: "danger",
        en_proceso: "warning",
    }[estado] || "secondary";

    const estadoIcono = {
        pendiente: "⏳",
        completado: "✅",
        cancelado: "❌",
        en_proceso: "🔄",
    }[estado] || "ℹ️";

    const capitalizar = (texto) =>
        texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();

    return (
        <div className="card h-100 shadow-sm border">
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">
                        Estado:{" "}
                        <span className={`badge bg-${estadoColor}`}>
                            {estadoIcono} {capitalizar(estado)}
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
                                    Empresa: {prod.nombreEmpresa}
                                </small>
                            </div>
                            <span className="badge bg-secondary">
                                {prod.cantidad} unidad(es)
                            </span>
                        </li>
                    ))}
                </ul>

                {estado === "pendiente" && (
                    <div className="mt-auto d-flex justify-content-end">
                        <button
                            className="btn btn-sm btn-danger"

                            onClick={() => onCancelar(pedido.id)}
                        >
                            ❌ Cancelar solicitud
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PedidoCard;
