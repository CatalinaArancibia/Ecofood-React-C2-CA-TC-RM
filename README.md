

EcoFood Community

## 📁 Estructura del Proyecto

/src
├─ components/
│ ├─ auth/
│ ├─ admin/
│ ├─ empresa/
│ └─ cliente/
├─ pages/
│ ├─ Login.jsx
│ ├─ Register.jsx
│ ├─ Home.jsx
│ └─ Perfil.jsx
├─ routes/
│ ├─ AppRouter.jsx
│ └─ ProtectedRoute.jsx
├─ context/
│ └─ AuthContext.jsx
├─ services/
│ ├─ firebase.js
│ └─ authService.js
├─ assets/
├─ App.jsx
├─ main.jsx

---

## 🚀 Funcionalidades Implementadas

- [x] Registro y login de usuarios con Firebase
- [x] Verificación de correo electrónico
- [x] Recuperación de contraseña
- [x] Rutas protegidas según sesión activa
- [x] Gestión de componentes por rol
- [x] Integración de Bootstrap y FontAwesome

---

## ✅ Corrección importante

Este repositorio fue reestructurado en el commit `fix: reestructura de carpetas y corrección de imports` para:
- Cumplir con la arquitectura solicitada por el docente
- Separar correctamente `components`, `pages`, `context` y `routes`
- Corregir todos los imports para que el servidor Vite funcione correctamente
