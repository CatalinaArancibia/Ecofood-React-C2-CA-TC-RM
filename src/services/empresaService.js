import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

const empresasCol = collection(db, "empresas");

export async function getEmpresas() {
  const snapshot = await getDocs(empresasCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addEmpresa(empresa) {
  const docRef = await addDoc(empresasCol, empresa);
  return { id: docRef.id, ...empresa };
}

export async function updateEmpresa(id, empresa) {
  const docRef = doc(db, "empresas", id);
  await updateDoc(docRef, empresa);
  return { id, ...empresa };
}

export async function deleteEmpresa(id) {
  const docRef = doc(db, "empresas", id);
  await deleteDoc(docRef);
}