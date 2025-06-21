/* Registro de empresas (admin) */

import React, { useEffect, useState } from "react";
import {
  getEmpresas,
  addEmpresa,       //  <-- ahora recibe (uid, datos)
  updateEmpresa,
  deleteEmpresa
} from "../../services/empresaService";
import { doc, getDoc }         from "firebase/firestore";
import { db, firebaseConfig }  from "../../services/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import "./Empresas.css";

/* ─────────────────────────────────────────────────────────────────── */
export default function Empresas() {
  /* estado */
  const [empresas, setEmpresas] = useState([]);
  const [comunas,  setComunas]  = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);
  const [editId,   setEditId]   = useState(null);

  const [form, setForm] = useState({
    nombre:"", rut:"", comuna:"", direccion:"",
    telefono:"", email:"", password:"", tipo:"empresa"
  });

  /* carga inicial */
  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [users] = await Promise.all([ getEmpresas(), cargarComunas() ]);
      setEmpresas(users.filter(u => u.tipo === "empresa"));
    } catch (e) { setError(e.message); }
    finally      { setLoading(false); }
  };

  const cargarComunas = async () => {
    const snap = await getDoc(doc(db, "config", "comuna"));
    const lista = snap.exists() ? snap.data().lista : [];
    setComunas(lista);
    return lista;
  };

  /* helpers */
  const handleChange = ({target}) =>
    setForm(prev => ({ ...prev, [target.name]: target.value }));

  const limpiar = () => setForm({
    nombre:"", rut:"", comuna:"", direccion:"",
    telefono:"", email:"", password:"", tipo:"empresa"
  });

  /* guardar / crear */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);

    /* validaciones básicas */
    if (!form.nombre || !form.rut || !form.comuna || !form.email) {
      setError("Nombre, RUT, comuna y email son obligatorios");
      return;
    }
    if (!editId && form.password.length < 6) {
      setError("Contraseña ≥ 6 caracteres");
      return;
    }
    if (!/^\d{7,8}-[\dkK]$/.test(form.rut)) {
      setError("RUT inválido (ej. 12345678-9)");
      return;
    }

    /* datos que SÍ se guardan */
    const datosEmpresa = {
      nombre:     form.nombre,
      rut:        form.rut,
      comuna:     form.comuna,
      direccion:  form.direccion,
      telefono:   form.telefono,
      email:      form.email,
      tipo:       "empresa",
      ubicacion:  `${form.comuna}, ${form.direccion}`
    };

    try {
      if (editId) {
        await updateEmpresa(editId, datosEmpresa);
        setSuccess("Empresa actualizada");
      } else {
        /* ① crear Auth en app secundaria */
        const secApp  = initializeApp(firebaseConfig, "secondary");
        const secAuth = getAuth(secApp);

        const cred = await createUserWithEmailAndPassword(
          secAuth, form.email, form.password
        );
        await sendEmailVerification(cred.user);

        /* ② guardar en Firestore usando el MISMO uid */
        await addEmpresa(cred.user.uid, datosEmpresa);

        /* ③ cerrar sesión secundaria y borrar app */
        await signOut(secAuth);
        await deleteApp(secApp);

        setSuccess("Empresa creada y correo de verificación enviado");
      }

      limpiar(); setEditId(null); cargarTodo();
    } catch (e) { setError(e.message); }
  };

  const handleEdit = (emp) => {
    setForm({
      nombre:emp.nombre, rut:emp.rut, comuna:emp.comuna,
      direccion:emp.direccion, telefono:emp.telefono,
      email:emp.email, password:"", tipo:"empresa"
    });
    setEditId(emp.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar empresa?")) return;
    try { await deleteEmpresa(id); setSuccess("Eliminada"); cargarTodo(); }
    catch { setError("Error al eliminar"); }
  };

  /* render */
  if (loading) return <div className="loading">Cargando empresas…</div>;

  const lista = empresas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.comuna.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="empresas-container">
      <h2>Gestión de Empresas</h2>

      <input
        className="busqueda-empresa-input"
        placeholder="Buscar por nombre o comuna"
        value={busqueda}
        onChange={e=>setBusqueda(e.target.value)}
      />

      {error   && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* formulario */}
      <form onSubmit={handleSubmit} className="empresa-form">
        <h3>{editId ? "Editar Empresa" : "Nueva Empresa"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre*</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>RUT*</label>
            <input name="rut" value={form.rut} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Comuna*</label>
            <select name="comuna" value={form.comuna} onChange={handleChange} required>
              <option value="">-- Seleccione comuna --</option>
              {comunas.map((c,i)=><option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange}/>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Email*</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required/>
          </div>
        </div>

        {!editId && (
          <div className="form-row">
            <div className="form-group">
              <label>Contraseña inicial*</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-submit">{editId ? "Actualizar" : "Agregar"}</button>
          {editId && (
            <button type="button" className="btn-cancel" onClick={()=>{ setEditId(null); limpiar(); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* tabla */}
      <div className="table-responsive">
        <table className="empresas-table">
          <thead>
            <tr><th>Nombre</th><th>RUT</th><th>Comuna</th><th>Email</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lista.length ? lista.map(emp=>(
              <tr key={emp.id}>
                <td>{emp.nombre}</td><td>{emp.rut}</td><td>{emp.comuna}</td><td>{emp.email}</td>
                <td>
                  <button className="btn-editar"   onClick={()=>handleEdit(emp)}>Editar</button>
                  <button className="btn-eliminar" onClick={()=>handleDelete(emp.id)}>Eliminar</button>
                </td>
              </tr>
            )) : <tr><td colSpan="5">No se encontraron empresas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

