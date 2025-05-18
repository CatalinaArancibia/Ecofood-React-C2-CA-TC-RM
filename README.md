EcoFood – Proyecto React + Firebase

---

📦 Tecnologías utilizadas

- React 18 + Vite
- Firebase (Authentication + Firestore)
- React Router DOM
- SweetAlert2
- Bootstrap 5

---

✅ Avance Entregado – Guía 1 y Guía 2 Completadas

🔐 Guía 1: Conexión con Firebase

- [x] Configuración de Firebase en `firebase.js`
- [x] Variables sensibles gestionadas en archivo `.env`
- [x] `.env` correctamente incluido en `.gitignore`
- [x] Archivo `firebase.js` usa `import.meta.env` para variables
- [x] Firebase conectado sin errores al correr `npm run dev`

🔑 Guía 2: Login y Logout con Firebase

- [x] Login funcional con `signInWithEmailAndPassword`
- [x] SweetAlert2 para retroalimentación en login
- [x] Redirección al Home después del login
- [x] Logout implementado con `signOut()` y botón `CerrarSesion`
- [x] Ruta `/home` protegida con `ProtectedRoute.jsx`
- [x] Contexto de sesión creado con `AuthContext`
- [x] App envuelta en `<AuthProvider>` dentro de `<BrowserRouter>`
- [x] Validación del usuario logueado con `useContext(AuthContext)`
