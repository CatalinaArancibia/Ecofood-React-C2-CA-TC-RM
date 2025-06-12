import React, { useEffect, useState } from "react";
import { getProductos } from "../../services/productoService";
import { getEmpresas } from "../../services/empresaService";

export default function ProductosAdminVisual() {
  const [productos, setProductos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [orden, setOrden] = useState("nombre-asc");
  const [limite, setLimite] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosData, empresasData] = await Promise.all([
          getProductos(),
          getEmpresas(),
        ]);
        setProductos(productosData);
        setEmpresas(empresasData);
      } catch (error) {
        console.error("Error al cargar productos o empresas:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getEmpresaNombre = (empresaId) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    return empresa ? empresa.nombre : "Desconocido";
  };

  // Filtro y búsqueda
  const productosFiltrados = productos.filter((p) => {
    const term = busqueda.toLowerCase();
    const empresaNombre = getEmpresaNombre(p.empresaId)?.toLowerCase() || "";

    const coincideBusqueda =
      p.nombre.toLowerCase().includes(term) || empresaNombre.includes(term);

    const coincideEstado =
      estadoFiltro === "todos" || p.estado === estadoFiltro;

    return coincideBusqueda && coincideEstado;
  });

  // Ordenamiento
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
    if (orden === "nombre-desc") return b.nombre.localeCompare(a.nombre);
    if (orden === "precio-asc") return a.precio - b.precio;
    if (orden === "precio-desc") return b.precio - a.precio;
    return 0;
  });

  // Paginación
  const inicio = (paginaActual - 1) * limite;
  const productosPaginados = productosOrdenados.slice(inicio, inicio + limite);
  const totalPaginas = Math.ceil(productosOrdenados.length / limite);

  return (
    <div className="container py-4">
      <h3>Visualización de Productos</h3>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por producto o empresa..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value);
              setPaginaActual(1);
            }}
          >
            <option value="todos">Todos</option>
            <option value="disponible">Disponible</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="precio-asc">Precio (↑)</option>
            <option value="precio-desc">Precio (↓)</option>
          </select>
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={limite}
            onChange={(e) => {
              setLimite(Number(e.target.value));
              setPaginaActual(1);
            }}
          >
            <option value={5}>5 / página</option>
            <option value={10}>10 / página</option>
            <option value={20}>20 / página</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Empresa</th>
            </tr>
          </thead>
          <tbody>
            {productosPaginados.length > 0 ? (
              productosPaginados.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion || "-"}</td>
                  <td>${producto.precio || 0}</td>
                  <td>{producto.cantidad || 0}</td>
                  <td>{producto.estado || "-"}</td>
                  <td>{getEmpresaNombre(producto.empresaId)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No se encontraron productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
        <button
          className="btn btn-outline-success"
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
        >
          ← Página anterior
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            className={`btn ${paginaActual === i + 1 ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setPaginaActual(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="btn btn-outline-success"
          disabled={paginaActual === totalPaginas}
          onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
        >
          Página siguiente →
        </button>
      </div>


      {/* Botón de volver arriba */}
      {scrollY > 100 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn btn-success rounded-circle"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
            width: "50px",
            height: "50px",
            fontSize: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            padding: "0",
          }}
          title="Volver arriba"
        >
          ↑
        </button>
      )}
    </div>
  );
}
