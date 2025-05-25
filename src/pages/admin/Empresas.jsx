// src/pages/admin/Empresas.js (o donde tengas tu componente Empresas)

import React, { useEffect, useState } from "react";
import {
  getEmpresas,
  addEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../../services/empresaService";

// --- Importa tu archivo CSS aquí ---
import './empresas.css'; // Asegúrate de que esta ruta sea correcta

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ nombre: "", rut: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  async function cargarEmpresas() {
    const data = await getEmpresas();
    setEmpresas(data);
  }

  const empresasFiltradas = empresas.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.rut.toLowerCase().includes(busqueda.toLowerCase())
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.rut.trim()) {
      alert("Completa todos los campos");
      return;
    }
    if (editId) {
      await updateEmpresa(editId, form);
      setEditId(null);
    } else {
      await addEmpresa(form);
    }
    setForm({ nombre: "", rut: "" });
    cargarEmpresas();
  }

  function handleEdit(empresa) {
    setForm({ nombre: empresa.nombre, rut: empresa.rut });
    setEditId(empresa.id);
  }

  async function handleDelete(id) {
    if (window.confirm("¿Eliminar esta empresa?")) {
      await deleteEmpresa(id);
      if (editId === id) {
        setEditId(null);
        setForm({ nombre: "", rut: "" });
      }
      cargarEmpresas();
    }
  }

  return (
    // --- Aplica las clases CSS a tus elementos HTML ---
    <div className="empresas-container"> {/* Contenedor principal */}
      <h2>Empresas</h2>
      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="busqueda-empresa-input" // Clase para el input de búsqueda
      />
      <form onSubmit={handleSubmit} className="empresa-form"> {/* Formulario de empresa */}
        <input
          name="nombre"
          placeholder="Nombre Empresa"
          value={form.nombre}
          onChange={handleChange}
        />
        <input
          name="rut"
          placeholder="RUT"
          value={form.rut}
          onChange={handleChange}
        />
        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
      </form>

      <table className="empresas-table"> {/* Tabla de empresas */}
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresasFiltradas.length ? (
            empresasFiltradas.map((empresa) => (
              <tr key={empresa.id}>
                <td>{empresa.nombre}</td>
                <td>{empresa.rut}</td>
                <td>
                  <button onClick={() => handleEdit(empresa)}>Editar</button>
                  <button onClick={() => handleDelete(empresa.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No se encontraron empresas</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}