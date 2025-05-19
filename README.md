EcoFood – Proyecto React + Firebase
IMPORTANTE!!!
node_modules no esta porque es muy pesado xd pero instalenlo ustedes

## 🚀 Tecnologías utilizadas

- React 18 + Vite
- Firebase (Authentication + Firestore)
- React Router DOM
- SweetAlert2
- Bootstrap 5

---

## ✅ Avance Entregado – Guías 1, 2 y 3 Completadas

---

## 📘 Guía 1: Conexión con Firebase

- ✅ Configuración de Firebase en `firebase.js`
- ✅ Variables sensibles gestionadas en archivo `.env`
- ✅ `.env` correctamente incluido en `.gitignore`
- ✅ `firebase.js` usa `import.meta.env` para variables
- ✅ Firebase conectado sin errores al correr `npm run dev`

---

## 📘 Guía 2: Login y Logout con Firebase

- ✅ Login funcional con `signInWithEmailAndPassword`
- ✅ SweetAlert2 para retroalimentación en login
- ✅ Redirección al Home después del login
- ✅ Logout implementado con `signOut()` y botón `CerrarSesion`
- ✅ Ruta `/home` protegida con `ProtectedRoute.jsx`
- ✅ Contexto de sesión creado con `AuthContext`
- ✅ App envuelta en `<AuthProvider>` dentro de `<BrowserRouter>`
- ✅ Validación del usuario logueado con `useContext(AuthContext)`

---

## 📘 Guía 3: Registro, Firestore y Verificación

- ✅ Formulario de registro exclusivo para tipo cliente
- ✅ Campos: nombre, correo, contraseña, dirección, comuna, teléfono
- ✅ `tipo` de usuario fijo como `"cliente"`
- ✅ Datos almacenados en `usuarios` de Firestore usando `uid` como ID
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Envío de correo de verificación tras registro
- ✅ Bloqueo de inicio de sesión hasta verificar correo
- ✅ Recuperación de contraseña con `sendPasswordResetEmail`
- ✅ Vista estilizada con Bootstrap y estilo personalizado (`Register.css`)

 
