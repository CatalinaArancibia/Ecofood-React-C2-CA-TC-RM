import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEmpresas,
  addEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getProductosByEmpresaId
} from "../../services/empresaService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import './Empresas.css';

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [comunas, setComunas] = useState([]);
  const [form, setForm] = useState({ 
    nombre: "", 
    rut: "", 
    comuna: "",
    direccion: "",
    telefono: "",
    correo: "",
    manejaProductos: false
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [productosData, setProductosData] = useState({}); // Ahora almacenamos todos los datos de productos
  const [loading, setLoading] = useState(true);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [currentProductos, setCurrentProductos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [empresasData, comunasData] = await Promise.all([
          getEmpresas(),
          fetchComunas()
        ]);
        setEmpresas(empresasData);
        
        // Cargar productos para cada empresa
        const productosPorEmpresa = {};
        for (const empresa of empresasData) {
          const productos = await getProductosByEmpresaId(empresa.id);
          productosPorEmpresa[empresa.id] = productos;
          
          // Actualizar estado de manejaProductos si la empresa tiene productos
          if (productos.length > 0 && !empresa.manejaProductos) {
            await updateEmpresa(empresa.id, { ...empresa, manejaProductos: true });
          }
        }
        setProductosData(productosPorEmpresa);
      } catch (error) {
        setError(error.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const fetchComunas = async () => {
    try {
      const docRef = doc(db, "config", "comuna");
      const docSnap = await getDoc(docRef);
      const comunasList = docSnap.exists() ? docSnap.data().lista : [];
      setComunas(comunasList);
      return comunasList;
    } catch (error) {
      console.error("Error al obtener las comunas:", error);
      setError("Error al cargar comunas");
      return [];
    }
  };

  const empresasFiltradas = empresas.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.comuna && e.comuna.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!form.nombre.trim() || !form.rut.trim() || !form.comuna.trim()) {
      setError("Nombre, RUT y Comuna son obligatorios");
      return;
    }

    if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(form.rut)) {
      setError("El RUT debe tener formato 12345678-9");
      return;
    }

    try {
      if (editId) {
        await updateEmpresa(editId, form);
        setSuccess("Empresa actualizada correctamente");
      } else {
        await addEmpresa(form);
        setSuccess("Empresa creada correctamente");
      }
      setForm({ 
        nombre: "", 
        rut: "", 
        comuna: "",
        direccion: "",
        telefono: "",
        correo: "",
        manejaProductos: false
      });
      setEditId(null);
      cargarEmpresas();
    } catch (error) {
      setError(error.message || "Error al guardar la empresa");
    }
  };

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      const data = await getEmpresas();
      setEmpresas(data);
      
      // Actualizar datos de productos
      const productosPorEmpresa = {};
      for (const empresa of data) {
        const productos = await getProductosByEmpresaId(empresa.id);
        productosPorEmpresa[empresa.id] = productos;
      }
      setProductosData(productosPorEmpresa);
    } catch (error) {
      setError(error.message || "Error al cargar empresas");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (empresa) => {
    // Verificar si la empresa tiene productos para actualizar el checkbox
    const tieneProductos = productosData[empresa.id] && productosData[empresa.id].length > 0;
    
    setForm({ 
      nombre: empresa.nombre || "", 
      rut: empresa.rut || "", 
      comuna: empresa.comuna || "",
      direccion: empresa.direccion || "",
      telefono: empresa.telefono || "",
      correo: empresa.correo || "",
      manejaProductos: tieneProductos || empresa.manejaProductos || false
    });
    setEditId(empresa.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta empresa?")) {
      try {
        await deleteEmpresa(id);
        if (editId === id) {
          setEditId(null);
          setForm({ 
            nombre: "", 
            rut: "", 
            comuna: "",
            direccion: "",
            telefono: "",
            correo: "",
            manejaProductos: false
          });
        }
        setSuccess("Empresa eliminada correctamente");
        await cargarEmpresas();
      } catch (error) {
        setError(error.message || "Error al eliminar la empresa");
      }
    }
  };

  const mostrarProductos = (empresaId) => {
    setCurrentProductos(productosData[empresaId] || []);
    setShowProductosModal(true);
  };

  const closeModal = () => {
    setShowProductosModal(false);
    setCurrentProductos([]);
  };

  if (loading) return <div className="loading">Cargando empresas...</div>;

  return (
    <div className="empresas-container">
      <h2>Gestión de Empresas</h2>

      <input
        type="text"
        placeholder="Buscar por nombre, RUT o comuna"
        className="busqueda-empresa-input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="empresa-form">
        <h3>{editId ? "Editando Empresa" : "Nueva Empresa"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre de la empresa*</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>RUT* (Ej: 12345678-9)</label>
            <input
              type="text"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Comuna*</label>
            <select
              name="comuna"
              value={form.comuna}
              onChange={handleChange}
              required
            >
              <option value="">-- Seleccione comuna --</option>
              {comunas.map((comuna, index) => (
                <option key={index} value={comuna}>
                  {comuna}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="manejaProductos"
              checked={form.manejaProductos}
              onChange={handleChange}
              disabled={productosData[editId] && productosData[editId].length > 0}
            />
            Maneja productos
            {productosData[editId] && productosData[editId].length > 0 && (
              <span className="checkbox-hint"> (Tiene productos registrados)</span>
            )}
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editId ? "Actualizar Empresa" : "Agregar Empresa"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditId(null);
                setForm({ 
                  nombre: "", 
                  rut: "", 
                  comuna: "",
                  direccion: "",
                  telefono: "",
                  correo: "",
                  manejaProductos: false
                });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table className="empresas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Comuna</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresasFiltradas.length > 0 ? (
              empresasFiltradas.map((empresa) => (
                <tr key={empresa.id}>
                  <td>{empresa.nombre}</td>
                  <td>{empresa.rut}</td>
                  <td>{empresa.comuna || "-"}</td>
                  <td>
                    {productosData[empresa.id] && productosData[empresa.id].length > 0 ? (
                      <button 
                        onClick={() => mostrarProductos(empresa.id)}
                        className="productos-button"
                      >
                        Ver {productosData[empresa.id].length} productos
                      </button>
                    ) : (
                      <span className="no-productos">No maneja</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(empresa)}
                      className="btn-editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(empresa.id)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No se encontraron empresas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para mostrar productos */}
      {showProductosModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Productos y Stock</h3>
              <button onClick={closeModal} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {currentProductos.length > 0 ? (
                <table className="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProductos.map((producto, index) => (
                      <tr key={index}>
                        <td>{producto.nombre}</td>
                        <td>{producto.stock || 0}</td>
                        <td>${producto.precio?.toLocaleString() || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No hay productos registrados</p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cerrar">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}