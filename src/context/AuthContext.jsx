import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserData } from "../services/userService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const extraData = await getUserData(firebaseUser.uid); // incluye campo `tipo`
          const combinedUser = {
            ...firebaseUser,
            ...extraData, // aquí estará `tipo: 'admin'` o `tipo: 'client'`
          };
          console.log("✅ Usuario autenticado:", combinedUser);
          setUser(combinedUser);
        } catch (error) {
          console.error("❌ Error al obtener datos:", error);
          setUser(firebaseUser); // fallback
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};