import React, { useEffect, useState } from "react";
import { getProductos } from "../../services/productoService";
import { getEmpresas } from "../../services/empresaService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import CantidadModal from "../../components/CantidadModal";
import CarritoSidebar from "../../components/CarritoSidebar";
import { guardarCarritoFirestore, cargarCarritoFirestore } from "../../services/carritoService";
import { generarPedido } from "../../services/pedidoService";

export default function ProductosCliente() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDireccion, setFiltroDireccion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("");
  const [orden, setOrden] = useState("nombre-asc");
  const [limite, setLimite] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [prods, emps] = await Promise.all([getProductos(), getEmpresas()]);
      setProductos(prods);
      setEmpresas(emps);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      cargarCarritoFirestore(user.uid).then((items) => setCarrito(items));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      guardarCarritoFirestore(user.uid, carrito);
    }
  }, [carrito]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getEmpresaNombre = (empresaId) => {
    const emp = empresas.find((e) => e.id === empresaId);
    return emp ? emp.nombre : "Desconocida";
  };

  const productosFiltrados = productos.filter((p) => {
    const hoy = new Date();
    const vencimiento = new Date(p.vencimiento);
    const enStock = p.cantidad > 0;
    const disponible = p.estado === "disponible";
    const noVencido = vencimiento >= hoy;

    const empresa = empresas.find((e) => e.id === p.empresaId);
    const nombreEmpresa = empresa?.nombre?.toLowerCase() || "";
    const direccionEmpresa = empresa?.direccion?.toLowerCase() || "";
    const comunaEmpresa = empresa?.comuna?.toLowerCase() || "";

    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreEmpresa.includes(busqueda.toLowerCase());

    const coincideDireccion =
      filtroDireccion === "" ||
      direccionEmpresa.includes(filtroDireccion.toLowerCase()) ||
      comunaEmpresa.includes(filtroDireccion.toLowerCase());

    const coincideEstado =
      filtroEstado === "" || p.estado === filtroEstado;

    const coincidePrecio =
      filtroPrecio === "" ||
      (filtroPrecio === "gratis" && p.precio === 0) ||
      (filtroPrecio === "pago" && p.precio > 0);

    return disponible && enStock && noVencido &&
      coincideBusqueda && coincideDireccion &&
      coincideEstado && coincidePrecio;
  });

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
    if (orden === "nombre-desc") return b.nombre.localeCompare(a.nombre);
    if (orden === "precio-asc") return a.precio - b.precio;
    if (orden === "precio-desc") return b.precio - a.precio;
    return 0;
  });

  const inicio = (paginaActual - 1) * limite;
  const productosPaginados = productosOrdenados.slice(inicio, inicio + limite);
  const totalPaginas = Math.ceil(productosOrdenados.length / limite);

  const handleAgregarAlCarro = (producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  const confirmarCantidad = (cantidad) => {
    const nuevoProducto = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      precio: productoSeleccionado.precio,
      cantidad: cantidad,
      empresaId: productoSeleccionado.empresaId,
    };

    setCarrito((prev) => [...prev, nuevoProducto]);

    Swal.fire(
      "Agregado",
      `${cantidad} unidades de ${productoSeleccionado.nombre} al carrito.`,
      "success"
    );

    setProductoSeleccionado(null);
  };

  const handleComprar = async () => {
    if (carrito.length === 0) return;

    try {
      await generarPedido(user.uid, carrito);
      await guardarCarritoFirestore(user.uid, []);
      setCarrito([]);
      Swal.fire("Pedido realizado", "Tu pedido ha sido enviado correctamente", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo completar el pedido", "error");
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroDireccion("");
    setFiltroEstado("");
    setFiltroPrecio("");
    setOrden("nombre-asc");
    setPaginaActual(1);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Explorar Productos Disponibles</h3>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre o empresa..."
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setPaginaActual(1);
        }}
      />

      <div className="row mb-3 align-items-end">
        <div className="col-md-4">
          <label>Buscar por dirección o comuna</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej. Providencia, La Serena..."
            value={filtroDireccion}
            onChange={(e) => {
              setFiltroDireccion(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <div className="col-md-4">
          <label>Filtrar por precio</label>
          <select
            className="form-select"
            value={filtroPrecio}
            onChange={(e) => {
              setFiltroPrecio(e.target.value);
              setPaginaActual(1);
            }}
          >
            <option value="">Todos</option>
            <option value="gratis">Gratuito</option>
            <option value="pago">De pago</option>
          </select>
        </div>

        <div className="col-md-4 d-flex justify-content-start mt-3 mt-md-0">
          <button
            className="btn btn-outline-secondary"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <label>Ordenar por</label>
          <select
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="precio-asc">Precio (↑) Menor a Mayor</option>
            <option value="precio-desc">Precio (↓) Mayor a Menor</option>
          </select>
        </div>

        <div className="col-md-4">
          <label>Productos por página</label>
          <select
            className="form-select"
            value={limite}
            onChange={(e) => {
              setLimite(Number(e.target.value));
              setPaginaActual(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {productosPaginados.length === 0 ? (
          <p>No hay productos disponibles</p>
        ) : (
          productosPaginados.map((p) => (
            <div key={p.id} className="col">
              <div className="card h-100 border shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{p.nombre}</h5>
                  <p className="card-text text-muted">{p.descripcion}</p>
                  <p className="card-text mb-1">
                    <strong>Empresa:</strong> {getEmpresaNombre(p.empresaId)}
                  </p>
                  <p className="card-text mb-0">
                    <strong>Stock:</strong> {p.cantidad}
                  </p>
                  <p className="card-text">
                    <strong>Precio:</strong>{" "}
                    {p.precio === 0 ? (
                      <span className="badge bg-success">Gratuito</span>
                    ) : (
                      <span className="text-primary fw-bold">${p.precio}</span>
                    )}
                  </p>
                </div>
                <div className="card-footer bg-white border-top d-flex justify-content-center">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleAgregarAlCarro(p)}
                  >
                    🛒 Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
          title="Volver arriba"
        >
          ↑
        </button>
      )}

      {modalVisible && productoSeleccionado && (
        <CantidadModal
          producto={productoSeleccionado}
          onConfirmar={confirmarCantidad}
          onCerrar={() => setModalVisible(false)}
        />
      )}

      <CarritoSidebar
        carrito={carrito}
        onVaciar={() => setCarrito([])}
        abierto={carritoAbierto}
        setAbierto={setCarritoAbierto}
        onComprar={handleComprar}
      />
    </div>
  );
}

