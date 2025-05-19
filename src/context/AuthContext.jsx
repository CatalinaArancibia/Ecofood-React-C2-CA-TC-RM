import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

// Crear el contexto
export const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export const useAuth = () => useContext(AuthContext);