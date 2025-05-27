import React, { useState, useEffect } from 'react';
import {
  getProductos,
  addProducto,
  updateProducto,
  deleteProducto
} from '../../services/productoService';
import { getEmpresas, addProductoToEmpresa, removeProductoFromEmpresa } from '../../services/empresaService';
import './Productos.css';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: ""
  });
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  // Categorías predefinidas
  const categorias = [
    "Electrónica",
    "Ropa",
    "Hogar",
    "Alimentos",
    "Bebidas",
    "Juguetes",
    "Deportes",
    "Oficina"
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, empresasData] = await Promise.all([
          getProductos(),
          getEmpresas()
        ]);
        setProductos(productosData);
        setEmpresas(empresasData);
      } catch (error) {
        setError("Error al cargar datos");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmpresaToggle = (empresaId) => {
    setEmpresasSeleccionadas(prev =>
      prev.includes(empresaId)
        ? prev.filter(id => id !== empresaId)
        : [...prev, empresaId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      if (editId) {
        // Actualizar producto
        await updateProducto(editId, form);
        
        // Obtener empresas actuales del producto
        const productoActual = productos.find(p => p.id === editId);
        const empresasActuales = productoActual?.empresas || [];
        
        // Añadir a nuevas empresas
        for (const empresaId of empresasSeleccionadas) {
          if (!empresasActuales.includes(empresaId)) {
            await addProductoToEmpresa(empresaId, editId);
          }
        }
        
        // Eliminar de empresas que ya no están seleccionadas
        for (const empresaId of empresasActuales) {
          if (!empresasSeleccionadas.includes(empresaId)) {
            await removeProductoFromEmpresa(empresaId, editId);
          }
        }
        
        setSuccess("Producto actualizado correctamente");
      } else {
        // Crear nuevo producto
        const nuevoProducto = await addProducto(form);
        
        // Añadir a empresas seleccionadas
        for (const empresaId of empresasSeleccionadas) {
          await addProductoToEmpresa(empresaId, nuevoProducto.id);
        }
        
        setSuccess("Producto agregado correctamente");
      }
      
      // Resetear formulario
      setForm({
        nombre: "",
        descripcion: "",
        precio: 0,
        stock: 0,
        categoria: ""
      });
      setEmpresasSeleccionadas([]);
      setEditId(null);
      cargarProductos();
    } catch (error) {
      setError(error.message || "Error al guardar el producto");
      console.error(error);
    }
  };

  const cargarProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      setError("Error al cargar productos");
      console.error(error);
    }
  };

  const handleEdit = async (producto) => {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio || 0,
      stock: producto.stock || 0,
      categoria: producto.categoria || ""
    });
    
    // Cargar empresas asociadas a este producto
    try {
      const empresasProducto = await getEmpresasByProductoId(producto.id);
      setEmpresasSeleccionadas(empresasProducto.map(e => e.id));
    } catch (error) {
      console.error("Error cargando empresas del producto:", error);
      setEmpresasSeleccionadas([]);
    }
    
    setEditId(producto.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProducto(id);
        if (editId === id) {
          setEditId(null);
          setForm({
            nombre: "",
            descripcion: "",
            precio: 0,
            stock: 0,
            categoria: ""
          });
          setEmpresasSeleccionadas([]);
        }
        setSuccess("Producto eliminado correctamente");
        cargarProductos();
      } catch (error) {
        setError("Error al eliminar el producto");
        console.error(error);
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="productos-container">
      <h2>Gestión de Productos</h2>

      <input
        type="text"
        placeholder="Buscar por nombre, descripción o categoría"
        className="busqueda-producto-input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="producto-form">
        <h3>{editId ? "Editando Producto" : "Nuevo Producto"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre*</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
            >
              <option value="">-- Seleccione categoría --</option>
              {categorias.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Precio ($)</label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="empresas-section">
          <h4>Empresas que venden este producto:</h4>
          <div className="empresas-grid">
            {empresas.map(empresa => (
              <label key={empresa.id} className="empresa-checkbox">
                <input
                  type="checkbox"
                  checked={empresasSeleccionadas.includes(empresa.id)}
                  onChange={() => handleEmpresaToggle(empresa.id)}
                />
                <span>{empresa.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editId ? "Actualizar Producto" : "Agregar Producto"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditId(null);
                setForm({
                  nombre: "",
                  descripcion: "",
                  precio: 0,
                  stock: 0,
                  categoria: ""
                });
                setEmpresasSeleccionadas([]);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table className="productos-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Empresas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion || "-"}</td>
                  <td>{producto.categoria || "-"}</td>
                  <td>${producto.precio?.toLocaleString() || "0"}</td>
                  <td>{producto.stock || "0"}</td>
                  <td>
                    {producto.empresas?.length > 0 ? (
                      <span className="empresas-count">{producto.empresas.length} empresas</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(producto)}
                      className="btn-editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No se encontraron productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
