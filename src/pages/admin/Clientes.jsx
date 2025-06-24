// src/pages/Clientes.jsx

import React, { useEffect, useState } from "react";
import {
  getClientes,
  addCliente,
  updateCliente,
  deleteCliente,
  verificarDuplicadosCliente
} from "../../services/clientesService";
import { doc, getDoc } from "firebase/firestore";
import { db, firebaseConfig } from "../../services/firebase";

import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "firebase/auth";

import "./Clientes.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    correo: "",
    password: ""
  });

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [list] = await Promise.all([getClientes(), cargarComunas()]);
      setClientes(list);
    } catch {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const cargarComunas = async () => {
    const snap = await getDoc(doc(db, "config", "comuna"));
    const lista = snap.exists() ? snap.data().lista : [];
    setComunas(lista);
    return lista;
  };

  const handleChange = ({ target }) =>
    setForm(prev => ({ ...prev, [target.name]: target.value }));

  const limpiar = () =>
    setForm({
      nombre: "",
      rut: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      correo: "",
      password: ""
    });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!form.nombre || !form.rut || !form.correo) {
      setError("Nombre, RUT y correo son obligatorios");
      setLoading(false);
      return;
    }
    if (!editId && form.password.length < 6) {
      setError("Contraseña ≥ 6 caracteres");
      setLoading(false);
      return;
    }
    if (!/^\d{7,8}-[0-9kK]{1}$/.test(form.rut)) {
      setError("RUT inválido");
      setLoading(false);
      return;
    }

    const datosCliente = {
      nombre: form.nombre,
      rut: form.rut,
      telefono: form.telefono,
      direccion: form.direccion,
      ciudad: form.ciudad,
      correo: form.correo,
      ubicacion: `${form.ciudad}, ${form.direccion}`
    };

    try {
      if (editId) {
        await updateCliente(editId, datosCliente);
        setSuccess("Cliente actualizado");
      } else {
        await verificarDuplicadosCliente({
          rut: form.rut,
          correo: form.correo,
          telefono: form.telefono
        });

        const secApp = initializeApp(firebaseConfig, "secondary");
        const secAuth = getAuth(secApp);
        const cred = await createUserWithEmailAndPassword(
          secAuth,
          form.correo,
          form.password
        );
        await sendEmailVerification(cred.user);

        await addCliente(cred.user.uid, datosCliente);

        await signOut(secAuth);
        await deleteApp(secApp);

        setSuccess("Cliente creado (verifique e-mail)");
      }

      limpiar();
      setEditId(null);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = c => {
    setForm({
      nombre: c.nombre,
      rut: c.rut,
      telefono: c.telefono || "",
      direccion: c.direccion || "",
      ciudad: c.ciudad || "",
      correo: c.correo,
      password: ""
    });
    setEditId(c.id);
  };

  const handleDelete = async id => {
    if (!window.confirm("¿Eliminar cliente?")) return;
    try {
      await deleteCliente(id);
      setSuccess("Cliente eliminado");
      if (editId === id) setEditId(null);
      cargar();
    } catch {
      setError("Error al eliminar cliente");
    }
  };

  const lista = clientes.filter(
    c =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.rut.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading && clientes.length === 0)
    return <div className="loading">Cargando…</div>;

  return (
    <div className="clientes-container">
      <h2>Gestión de Clientes</h2>

      <input
        className="busqueda-cliente-input"
        placeholder="Buscar por nombre o RUT"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        disabled={loading}
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="cliente-form">
        <h3>{editId ? "Editar Cliente" : "Nuevo Cliente"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre*</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>RUT*</label>
            <input
              name="rut"
              value={form.rut}
              onChange={handleChange}
              pattern="\d{7,8}-[0-9kK]{1}"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              maxLength={15}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Comuna</label>
            <select
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">-- Seleccione comuna --</option>
              {comunas.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Email*</label>
            <input
              name="correo"
              type="email"
              required
              value={form.correo}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {!editId && (
          <div className="form-group">
            <label>Contraseña inicial*</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}

        <div className="form-actions">
          <button className="btn-submit" disabled={loading}>
            {loading
              ? "Procesando…"
              : editId
                ? "Actualizar"
                : "Crear Cliente"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditId(null);
                limpiar();
              }}
              disabled={loading}
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
            {lista.length ? (
              lista.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.rut}</td>
                  <td>{c.telefono || "-"}</td>
                  <td>{c.direccion || "-"}</td>
                  <td>{c.ciudad || "-"}</td>
                  <td>{c.correo}</td>
                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => handleEdit(c)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => handleDelete(c.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No se encontraron clientes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
