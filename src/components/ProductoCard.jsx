import React from "react";

const ProductoCard = ({ producto, onEditar, onEliminar }) => {
    const vencimiento = new Date(producto.vencimiento);
    const hoy = new Date();
    const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body">
                <h5 className="card-title">{producto.nombre}</h5>
                <p className="card-text">{producto.descripcion}</p>

                <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item">Cantidad: {producto.cantidad}</li>
                    <li className="list-group-item">
                        Precio: {producto.precio === 0 ? (
                            <span className="badge bg-success">Gratuito</span>
                        ) : (
                            `$${producto.precio}`
                        )}
                    </li>
                    <li className="list-group-item">
                        Estado: <strong>{producto.estado}</strong>
                    </li>
                    <li className="list-group-item">
                        Vence: {vencimiento.toLocaleDateString()}{" "}
                        {diasRestantes <= 3 && diasRestantes >= 0 && (
                            <span className="badge bg-warning text-dark ms-2">¡Por vencer!</span>
                        )}
                    </li>
                </ul>

                <div className="d-flex justify-content-between">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEditar(producto)}>
                        Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(producto.id)}>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductoCard;
