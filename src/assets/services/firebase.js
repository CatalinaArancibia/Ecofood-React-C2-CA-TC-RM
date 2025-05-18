import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDXquQsYEJ8x0SYJdTqDsWa7QFYfxTtHUU",
  authDomain: "eco-food-react.firebaseapp.com",
  projectId: "eco-food-react",
  storageBucket: "eco-food-react.firebasestorage.app",
  messagingSenderId: "203790258113",
  appId: "1:203790258113:web:f6b7dcb9e4c80c511d6940",
  measurementId: "G-ZSRPBQ3LP5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

sendPasswordResetEmail(auth, correo)