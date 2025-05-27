import React, { useEffect, useState } from "react";
import {
  getClientes,
  addCliente,
  updateCliente,
  deleteCliente
} from "../../services/clientesService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import "./Clientes.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [comunas, setComunas] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    correo: ""
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarClientes();
    fetchComunas();
  }, []);

  const cargarClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      setError("Error al cargar clientes");
      console.error(error);
    }
  };

  const fetchComunas = async () => {
    try {
      const docRef = doc(db, "config", "comunas");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setComunas(docSnap.data().lista);
      }
    } catch (error) {
      console.error("Error al obtener las comunas:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.rut.trim()) {
      setError("Nombre y RUT son obligatorios");
      return;
    }

    try {
      if (editId) {
        await updateCliente(editId, form);
      } else {
        await addCliente(form);
      }

      setForm({
        nombre: "",
        rut: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        correo: ""
      });
      setEditId(null);
      cargarClientes();
    } catch (error) {
      setError("Error al guardar el cliente");
      console.error(error);
    }
  };

  const handleEdit = (cliente) => {
    setForm({
      nombre: cliente.nombre || "",
      rut: cliente.rut || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      ciudad: cliente.ciudad || "",
      correo: cliente.correo || ""
    });
    setEditId(cliente.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        cargarClientes();
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        setError("Error al eliminar cliente");
      }
    }
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.rut.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="clientes-container">
      <h2>Gestión de Clientes</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o RUT"
        className="busqueda-cliente-input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="cliente-form">
        <h3>{editId ? "Editando Cliente" : "Nuevo Cliente"}</h3>

        <div className="form-group">
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>RUT</label>
          <input
            type="text"
            name="rut"
            value={form.rut}
            onChange={handleChange}
            required
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
          <label>Comuna</label>
          <select
            name="ciudad"
            value={form.ciudad}
            onChange={handleChange}
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

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editId ? "Actualizar Cliente" : "Crear Cliente"}
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
                  telefono: "",
                  direccion: "",
                  ciudad: "",
                  correo: ""
                });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-responsive">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Comuna</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7">No se encontraron clientes</td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.rut}</td>
                  <td>{cliente.telefono || "-"}</td>
                  <td>{cliente.direccion || "-"}</td>
                  <td>{cliente.ciudad || "-"}</td>
                  <td>{cliente.correo || "-"}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="btn-editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
