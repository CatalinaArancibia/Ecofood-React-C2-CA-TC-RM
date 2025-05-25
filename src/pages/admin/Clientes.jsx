import React, { useEffect, useState } from "react";
import {
  obtenerClientes,
  agregarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../../services/clientesService";
import "./Clientes.css";

export default function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    correo: "",
  });
  const [editandoId, setEditandoId] = useState(null);

  const cargarClientes = async () => {
    const lista = await obtenerClientes();
    setClientes(lista);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.rut.trim()) {
      alert("Por favor completa el Nombre y RUT.");
      return;
    }

    if (editandoId) {
      await actualizarCliente(editandoId, form);
      setEditandoId(null);
    } else {
      await agregarCliente(form);
    }

    setForm({
      nombre: "",
      rut: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      correo: "",
    });

    cargarClientes();
  };

  const editarCliente = (cliente) => {
    setForm({
      nombre: cliente.nombre || "",
      rut: cliente.rut || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      ciudad: cliente.ciudad || "",
      correo: cliente.correo || "",
    });
    setEditandoId(cliente.id);
  };

  const borrarCliente = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      await eliminarCliente(id);
      cargarClientes();
    }
  };

  // filtro para búsqueda igual
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
        className="busqueda-input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <form onSubmit={guardarCliente} className="cliente-form">
        <input
          name="nombre"
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          name="rut"
          type="text"
          placeholder="RUT"
          value={form.rut}
          onChange={handleChange}
          required
        />
        <input
          name="telefono"
          type="text"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
        />
        <input
          name="direccion"
          type="text"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
        />
        <input
          name="ciudad"
          type="text"
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={handleChange}
        />
        <input
          name="correo"
          type="email"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
        />
        <button type="submit">{editandoId ? "Actualizar" : "Agregar"}</button>
      </form>

      <table className="clientes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No se encontraron clientes.
              </td>
            </tr>
          ) : (
            clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.rut}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.direccion}</td>
                <td>{cliente.ciudad}</td>
                <td>{cliente.correo}</td>
                <td>
                  <button onClick={() => editarCliente(cliente)}>Editar</button>
                  <button onClick={() => borrarCliente(cliente.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}