import React, { useState, useEffect } from "react";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../services/adminFirebase";

import "./Administradores.css";

export default function Administradores() {
  const [admins, setAdmins] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    correo: "",
    tipo: "secundario", // 'principal' o 'secundario'
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  // Cargar admins desde Firestore
  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Manejar input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormData({
      nombre: "",
      rut: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      correo: "",
      tipo: "secundario",
    });
    setEditId(null);
    setError(null);
  };

  // Guardar nuevo admin o actualizar existente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (
      !formData.nombre.trim() ||
      !formData.rut.trim() ||
      !formData.telefono.trim() ||
      !formData.direccion.trim() ||
      !formData.ciudad.trim() ||
      !formData.correo.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      if (editId) {
        // Actualizar
        await updateAdmin(editId, formData);
      } else {
        // Si ya existe un admin principal y se intenta crear otro con tipo 'principal' impedirlo
        if (
          formData.tipo === "principal" &&
          admins.some((a) => a.tipo === "principal")
        ) {
          setError(
            "Ya existe un administrador principal. Solo puede haber uno."
          );
          return;
        }
        // Crear
        await createAdmin(formData);
      }
      await fetchAdmins();
      limpiarFormulario();
    } catch (e) {
      setError(e.message);
    }
  };

  // Editar admin (cargar datos al formulario)
  const handleEditar = (admin) => {
    setFormData(admin);
    setEditId(admin.id);
    setError(null);
  };

  // Eliminar admin con validación para no borrar principal
  const handleEliminar = async (id) => {
    setError(null);
    try {
      await deleteAdmin(id, admins);
      await fetchAdmins();
    } catch (e) {
      setError(e.message);
    }
  };

  // Filtrar admins para búsqueda
  const adminsFiltrados = admins.filter((admin) =>
    admin.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admins-container">
      <h2>Administradores</h2>

      <input
        type="text"
        placeholder="Buscar por nombre"
        className="busqueda-input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {error && <p className="error-message">{error}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
        />
        <input
          type="text"
          name="rut"
          placeholder="RUT"
          value={formData.rut}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={formData.ciudad}
          onChange={handleChange}
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
        />

        <select name="tipo" value={formData.tipo} onChange={handleChange}>
          <option value="principal">Principal</option>
          <option value="secundario">Secundario</option>
        </select>

        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
        {editId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={limpiarFormulario}
          >
            Cancelar
          </button>
        )}
      </form>

      <table className="admins-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Correo</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {adminsFiltrados.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.nombre}</td>
              <td>{admin.rut}</td>
              <td>{admin.telefono}</td>
              <td>{admin.direccion}</td>
              <td>{admin.ciudad}</td>
              <td>{admin.correo}</td>
              <td>{admin.tipo}</td>
              <td>
                <button onClick={() => handleEditar(admin)}>Editar</button>
                {admin.tipo !== "principal" && (
                  <button onClick={() => handleEliminar(admin.id)}>Eliminar</button>
                )}
              </td>
            </tr>
          ))}
          {adminsFiltrados.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No se encontraron administradores.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
