import React from "react";

const CarritoSidebar = ({ carrito, onVaciar, abierto, setAbierto, onComprar }) => {
    const total = carrito.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );

    const sidebarWidth = 300;

    return (
        <>
            {/* Botón "Ver carrito" o "Cerrar" */}
            <button
                onClick={() => setAbierto(!abierto)}
                className="btn btn-outline-dark shadow-sm"
                style={{
                    position: "fixed",
                    top: "20px",
                    right: abierto ? `${sidebarWidth + 10}px` : "0px", // SIEMPRE visible
                    zIndex: 1051,
                    borderRadius: "8px 0 0 8px",
                    padding: "6px 12px",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    transition: "right 0.3s ease-in-out",
                    fontSize: "14px",
                    whiteSpace: "nowrap"
                }}
                title={abierto ? "Cerrar carrito" : "Abrir carrito"}
            >
                {abierto ? "❌" : "🛒 Ver carrito"}
            </button>



            {/* Sidebar carrito */}
            <div
                className="bg-light border-start shadow"
                style={{
                    position: "fixed",
                    top: 0,
                    right: abierto ? 0 : `-${sidebarWidth}px`,
                    width: `${sidebarWidth}px`,
                    height: "100vh",
                    zIndex: 1040,
                    overflowY: "auto",
                    transition: "right 0.3s ease-in-out",
                }}
            >
                <div className="p-3 pt-4">
                    <h5 className="fw-bold mb-3">🛒 Mi carrito</h5>

                    {carrito.length === 0 ? (
                        <p className="text-muted">No hay productos agregados.</p>
                    ) : (
                        <>
                            <ul className="list-group list-group-flush mb-3">
                                {carrito.map((item, i) => (
                                    <li key={i} className="list-group-item d-flex justify-content-between">
                                        <div>
                                            <strong>{item.nombre}</strong>
                                            <br />
                                            <small>{item.cantidad} × ${item.precio}</small>
                                        </div>
                                        <span>${(item.precio * item.cantidad).toLocaleString("es-CL")}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="fw-bold fs-5 mb-3">
                                Total: ${total.toLocaleString("es-CL")}
                            </div>
                            <button className="btn btn-primary w-100" onClick={onComprar}>
                                Confirmar compra
                            </button>
                            <button className="btn btn-danger w-100" onClick={onVaciar}>
                                Vaciar carrito
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CarritoSidebar;



