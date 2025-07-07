// src/pages/Administradores.jsx

import React, { useEffect, useState } from "react";
import {
  getAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  getNonAdminUsers,
  promoteUserToAdmin,
  validateUniqueFields
} from "../../services/adminFirebase";

import { doc, getDoc } from "firebase/firestore";
import { db, firebaseConfig } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "firebase/auth";

import "./Administradores.css";

export default function Administradores() {
  const { currentUser } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [nonAdminUsers, setNonAdminUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [comunas, setComunas] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    direccion: "",
    comuna: "",
    email: "",
    password: "",
    tipoAdmin: "secundario"
  });
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [promoteLoading, setPromoteLoading] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoteForm, setPromoteForm] = useState({ rut: "", telefono: "" });

  useEffect(() => {
    cargarAdmins();
    cargarComunas();
    cargarUsuariosNoAdmin();
  }, []);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const cargarAdmins = async () => {
    setLoading(true);
    try {
      setAdmins(await getAdmins());
    } catch {
      setError("Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuariosNoAdmin = async () => {
    try {
      setNonAdminUsers(await getNonAdminUsers());
    } catch {
      setError("Error al cargar usuarios");
    }
  };

  const cargarComunas = async () => {
    const snap = await getDoc(doc(db, "config", "comuna"));
    if (snap.exists()) setComunas(snap.data().lista);
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;
    if (name === "telefono" && value.length > 15) return;
    if (name === "rut" && value.length > 12) return;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      rut: "",
      telefono: "",
      direccion: "",
      comuna: "",
      email: "",
      password: "",
      tipoAdmin: "secundario"
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!form.nombre || !form.rut || !form.email) {
      setError("Nombre, RUT y email son obligatorios");
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

    const datos = {
      nombre: form.nombre,
      rut: form.rut,
      telefono: form.telefono,
      direccion: form.direccion,
      comuna: form.comuna,
      email: form.email,
      tipoAdmin: form.tipoAdmin,
    };

    try {
      if (editId) {
        await updateAdmin(editId, datos, currentUser?.uid);
        setSuccess("Administrador actualizado");
      } else {
        await validateUniqueFields(datos);

        const secApp = initializeApp(firebaseConfig, "secondary");
        const secAuth = getAuth(secApp);

        const cred = await createUserWithEmailAndPassword(
          secAuth,
          form.email,
          form.password
        );
        await sendEmailVerification(cred.user);

        await addAdmin(cred.user.uid, datos);

        await signOut(secAuth);
        await deleteApp(secApp);

        setSuccess("Administrador creado (verifique e-mail)");
      }

      resetForm();
      cargarAdmins();
      cargarUsuariosNoAdmin();
    } catch (err) {
      // Mostrar errores específicos al cliente
      if (err.code === "auth/email-already-in-use") {
        setError("El correo ya está en uso por otro usuario.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo ingresado no es válido.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (err.message?.includes("RUT ya registrado")) {
        setError("El RUT ya está en uso por otro administrador.");
      } else if (err.message?.includes("email ya registrado")) {
        setError("El correo ya está registrado.");
      } else if (err.message?.includes("telefono ya registrado")) {
        setError("El teléfono ya está registrado.");
      } else {
        setError("Error: " + (err.message || "Error desconocido."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = a => {
    if (a.tipoAdmin === "principal" && a.id !== currentUser?.uid) {
      setError("Solo el admin principal puede editar su propia cuenta");
      return;
    }
    setForm({
      nombre: a.nombre,
      rut: a.rut || "",
      telefono: a.telefono || "",
      direccion: a.direccion || "",
      comuna: a.comuna || "",
      email: a.email || "",
      password: "",
      tipoAdmin: a.tipoAdmin || "secundario"
    });
    setEditId(a.id);
    setError(null);
  };

  const handleDelete = async id => {
    if (
      !window.confirm(
        "¿Quitar privilegios? El usuario volverá a ser cliente."
      )
    )
      return;
    try {
      await deleteAdmin(id, currentUser?.uid);
      setSuccess("Administrador convertido a cliente");
      if (editId === id) resetForm();
      cargarAdmins();
      cargarUsuariosNoAdmin();
    } catch (err) {
      setError(err.message);
    }
  };

  const promoteToAdmin = uid => {
    const u = nonAdminUsers.find(x => x.id === uid);
    setSelectedUser(u);
    setPromoteForm({ rut: u.rut || "", telefono: u.telefono || "" });
    setShowPromoteModal(true);
  };

  const handlePromoteSubmit = async () => {
    if (!/^\d{7,8}-[0-9kK]{1}$/.test(promoteForm.rut.trim())) {
      setError("RUT inválido");
      return;
    }
    try {
      setPromoteLoading(true);
      setError(null);
      await promoteUserToAdmin(selectedUser.id, {
        ...selectedUser,
        rut: promoteForm.rut,
        telefono: promoteForm.telefono,
        tipoAdmin: "secundario"
      });
      setSuccess("Promoción exitosa");
      setShowPromoteModal(false);
      cargarAdmins();
      cargarUsuariosNoAdmin();
    } catch (err) {
      setError(err.message);
    } finally {
      setPromoteLoading(false);
    }
  };

  const adminsFiltrados = admins.filter(
    a =>
      a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.rut?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admins-container">
      <h2>Gestión de Administradores</h2>

      <input
        className="busqueda-admin-input"
        placeholder="Buscar por nombre o RUT"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        disabled={loading}
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="promote-section">
        <button
          className="btn-toggle-users"
          disabled={loading}
          onClick={() => setShowUserList(s => !s)}
        >
          {showUserList
            ? "Ocultar clientes"
            : "Mostrar clientes para promover"}
          <i
            className={`fas fa-chevron-${showUserList
              ? "up"
              : "down"}`}
          ></i>
        </button>

        {showUserList && (
          <div className="promote-users-container">
            <h3>Clientes disponibles para promover</h3>

            {nonAdminUsers.length === 0 ? (
              <p className="no-users">No hay clientes registrados</p>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>RUT</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonAdminUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.nombre || "-"}</td>
                        <td>{u.rut || "-"}</td>
                        <td>{u.email || "-"}</td>
                        <td>{u.telefono || "-"}</td>
                        <td>
                          <button
                            className="btn-promote"
                            disabled={promoteLoading}
                            onClick={() => promoteToAdmin(u.id)}
                          >
                            Promover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>
          {editId ? "Editando Administrador" : "Nuevo Administrador"}
        </h3>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre completo*</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>RUT* (12345678-9)</label>
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
            <label>Email*</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              maxLength={100}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Comuna</label>
            <select
              name="comuna"
              value={form.comuna}
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
        </div>

        <div className="form-group">
          <label>Tipo de Administrador</label>
          <select
            name="tipoAdmin"
            value={form.tipoAdmin}
            onChange={handleChange}
            disabled={
              loading || (editId && form.tipoAdmin === "principal")
            }
          >
            <option value="secundario">Secundario</option>
            <option value="principal">Principal</option>
          </select>
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
                : "Crear Administrador"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {showPromoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              Promover a {selectedUser?.nombre || "Cliente"}
            </h3>
            <p>Complete los datos requeridos:</p>

            <div className="form-group">
              <label>RUT *</label>
              <input
                value={promoteForm.rut}
                onChange={e =>
                  setPromoteForm({ ...promoteForm, rut: e.target.value })
                }
                placeholder="12345678-9"
                minLength={9}
                maxLength={12}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                value={promoteForm.telefono}
                onChange={e =>
                  setPromoteForm({ ...promoteForm, telefono: e.target.value })
                }
                placeholder="+56912345678"
                maxLength={15}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowPromoteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-submit"
                onClick={handlePromoteSubmit}
                disabled={promoteLoading}
              >
                {promoteLoading ? "Procesando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admins-table-container">
        <h3>Lista de Administradores</h3>

        {loading && admins.length === 0 ? (
          <p>Cargando administradores…</p>
        ) : (
          <table className="admins-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adminsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    {busqueda
                      ? "No hay coincidencias"
                      : "No hay administradores registrados"}
                  </td>
                </tr>
              ) : (
                adminsFiltrados.map(a => (
                  <tr key={a.id}>
                    <td>{a.nombre}</td>
                    <td>{a.rut || "-"}</td>
                    <td>{a.telefono || "-"}</td>
                    <td>{a.email || "-"}</td>
                    <td>
                      <span
                        className={`badge ${a.tipoAdmin === "principal"
                            ? "primary"
                            : "secondary"
                          }`}
                      >
                        {a.tipoAdmin === "principal"
                          ? "Principal"
                          : "Secundario"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-editar"
                        onClick={() => handleEdit(a)}
                        disabled={
                          a.tipoAdmin === "principal" &&
                          a.id !== currentUser?.uid
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => handleDelete(a.id)}
                        disabled={
                          a.tipoAdmin === "principal" ||
                          a.id === currentUser?.uid
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
