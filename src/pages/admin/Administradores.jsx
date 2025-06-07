import React, { useEffect, useState } from "react";
import { 
  getAdmins, 
  addAdmin, 
  updateAdmin, 
  deleteAdmin, 
  getNonAdminUsers,
  promoteUserToAdmin
} from "../../services/adminFirebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
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
    ciudad: "",
    correo: "",
    tipoAdmin: "secundario"
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoteForm, setPromoteForm] = useState({
    rut: "",
    telefono: ""
  });

  useEffect(() => {
    cargarAdmins();
    fetchComunas();
    cargarUsuariosNoAdmin();
  }, []);

  const cargarAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      setError("Error al cargar administradores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuariosNoAdmin = async () => {
    try {
      const data = await getNonAdminUsers();
      const clientes = data.filter(user => user.tipo === "cliente");
      setNonAdminUsers(clientes);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const fetchComunas = async () => {
    try {
      const docRef = doc(db, "config", "comuna");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setComunas(docSnap.data().lista);
      }
    } catch (error) {
      console.error("Error al obtener las comunas:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validaciones para min/max
    if (name === "telefono" && value.length > 15) return;
    if (name === "rut" && value.length > 12) return;
    setForm({ ...form, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);
  setLoading(true);

  const rutRegex = /^\d{7,8}-[0-9kK]{1}$/;

  if (!form.nombre.trim() || !form.rut.trim()) {
    setError("Nombre y RUT son obligatorios");
    setLoading(false); // Añadir esto para detener el loading
    return;
  }

  if (!rutRegex.test(form.rut)) {
    setError("El RUT debe tener el formato 12345678-9");
    setLoading(false); // Añadir esto para detener el loading
    return;
  }

  try {
    if (editId) {
      await updateAdmin(editId, form, currentUser?.uid);
      setSuccess("Administrador actualizado correctamente");
    } else {
      await addAdmin(form);
      setSuccess("Administrador creado correctamente");
    }

    resetForm();
    cargarAdmins();
    cargarUsuariosNoAdmin();
  } catch (error) {
    setError(error.message || "Error al guardar el administrador");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setForm({
      nombre: "",
      rut: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      correo: "",
      tipoAdmin: "secundario"
    });
    setEditId(null);
  };

  const handleEdit = (admin) => {
    if (admin.tipoAdmin === "principal" && admin.id !== currentUser?.uid) {
      setError("Solo el administrador principal puede editar su propia cuenta");
      return;
    }
    
    setForm({
      nombre: admin.nombre || "",
      rut: admin.rut || "",
      telefono: admin.telefono || "",
      direccion: admin.direccion || "",
      ciudad: admin.ciudad || "",
      correo: admin.correo || "",
      tipoAdmin: admin.tipoAdmin || "secundario"
    });
    setEditId(admin.id);
    setError(null);
  };

const handleDelete = async (id) => {
  if (window.confirm("¿Estás seguro de quitar los privilegios de administrador? El usuario volverá a ser cliente.")) {
    try {
      await deleteAdmin(id, currentUser?.uid);
      setSuccess("Administrador convertido a cliente correctamente");
      
      if (editId === id) {
        resetForm();
      }
      
      await cargarAdmins();
      await cargarUsuariosNoAdmin();
    } catch (error) {
      setError(error.message || "Error al convertir el administrador");
      console.error(error);
    }
  }
};


  const promoteToAdmin = (userId) => {
    const user = nonAdminUsers.find(u => u.id === userId);
    setSelectedUser(user);
    setPromoteForm({
      rut: user.rut || "",
      telefono: user.telefono || ""
    });
    setShowPromoteModal(true);
  };

  const handlePromoteSubmit = async () => {
  if (!promoteForm.rut.trim()) {
    setError("El RUT es obligatorio");
    setPromoteLoading(false); 
    return;
  }

  const rutRegex = /^\d{7,8}-[0-9kK]{1}$/;
  if (!rutRegex.test(promoteForm.rut)) {
    setError("El RUT debe tener el formato 12345678-9");
    setPromoteLoading(false); 
    return;
  }

  try {
    setPromoteLoading(true);
    setError(null);
    
    const adminData = {
      nombre: selectedUser.nombre || "Administrador",
      rut: promoteForm.rut,
      telefono: promoteForm.telefono,
      direccion: selectedUser.direccion || "",
      ciudad: selectedUser.ciudad || "",
      correo: selectedUser.correo || "",
      tipoAdmin: "secundario"
    };

    await promoteUserToAdmin(selectedUser.id, adminData);
    
    setSuccess(`${selectedUser.nombre || 'Cliente'} promovido a administrador correctamente`);
    setShowPromoteModal(false);
    cargarAdmins();
    cargarUsuariosNoAdmin();
  } catch (error) {
    setError(error.message || "Error al promover el cliente");
    console.error(error);
  } finally {
    setPromoteLoading(false);
  }
};

  const adminsFiltrados = admins.filter((admin) => {
  const nombre = admin.nombre ? admin.nombre.toLowerCase() : '';
  const rut = admin.rut ? admin.rut.toLowerCase() : '';
  const busquedaLower = busqueda.toLowerCase();
  
  return nombre.includes(busquedaLower) || rut.includes(busquedaLower);
});

  return (
    <div className="admins-container">
      <h2>Gestión de Administradores</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o RUT"
        className="busqueda-admin-input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        disabled={loading}
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="promote-section">
        <button 
          onClick={() => setShowUserList(!showUserList)}
          className="btn-toggle-users"
          disabled={loading}
        >
          {showUserList ? 'Ocultar clientes' : 'Mostrar clientes para promover'}
          <i className={`fas fa-chevron-${showUserList ? 'up' : 'down'}`}></i>
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
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonAdminUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.nombre || '-'}</td>
                        <td>{user.rut || '-'}</td>
                        <td>{user.correo || '-'}</td>
                        <td>{user.telefono || '-'}</td>
                        <td>
                          <button
                            onClick={() => promoteToAdmin(user.id)}
                            className="btn-promote"
                            disabled={promoteLoading}
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
        <h3>{editId ? "Editando Administrador" : "Nuevo Administrador"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre completo*</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="50"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>RUT*</label>
            <input
              type="text"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              required
              minLength="8"
              maxLength="12"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              minLength="8"
              maxLength="15"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              maxLength="50"
              disabled={loading}
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
              maxLength="100"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Comuna</label>
            <select
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">-- Seleccione comuna --</option>
              {comunas.map((comuna, index) => (
                <option key={index} value={comuna}>
                  {comuna}
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
            disabled={loading || (editId && form.tipoAdmin === "principal")}
          >
            <option value="secundario">Secundario</option>
            <option value="principal">Principal</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Procesando..." : editId ? "Actualizar" : "Crear Administrador"}
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
            <h3>Promover a {selectedUser?.nombre || 'Cliente'}</h3>
            <p>Complete los datos requeridos:</p>
            
            <div className="form-group">
              <label>RUT *</label>
              <input
                type="text"
                value={promoteForm.rut}
                onChange={(e) => setPromoteForm({...promoteForm, rut: e.target.value})}
                placeholder="12345678-9"
                required
                minLength="8"
                maxLength="12"
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={promoteForm.telefono}
                onChange={(e) => setPromoteForm({...promoteForm, telefono: e.target.value})}
                placeholder="+56912345678"
                minLength="8"
                maxLength="15"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowPromoteModal(false)} 
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePromoteSubmit} 
                className="btn-submit"
                disabled={promoteLoading}
              >
                {promoteLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admins-table-container">
        <h3>Lista de Administradores</h3>
        {loading && admins.length === 0 ? (
          <p>Cargando administradores...</p>
        ) : (
          <table className="admins-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adminsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    {busqueda ? "No hay coincidencias" : "No hay administradores registrados"}
                  </td>
                </tr>
              ) : (
                adminsFiltrados.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.nombre}</td>
                    <td>{admin.rut || '-'}</td>
                    <td>{admin.telefono || '-'}</td>
                    <td>{admin.correo || '-'}</td>
                    <td>
                      <span className={`badge ${admin.tipoAdmin === 'principal' ? 'primary' : 'secondary'}`}>
                        {admin.tipoAdmin === 'principal' ? 'Principal' : 'Secundario'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="btn-editar"
                        disabled={admin.tipoAdmin === "principal" && admin.id !== currentUser?.uid}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="btn-cancel"
                        disabled={admin.tipoAdmin === "principal" || admin.id === currentUser?.uid}
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