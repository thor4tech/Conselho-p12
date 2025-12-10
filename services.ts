
// Fix: Use named import for firebase/app
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp
} from "firebase/firestore";

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyBtLL03ozMEbmkGodZCe7SrjqM8tRFHE8o",
  authDomain: "projetos-thor4tech.firebaseapp.com",
  projectId: "projetos-thor4tech",
  storageBucket: "projetos-thor4tech.firebasestorage.app",
  messagingSenderId: "553678534542",
  appId: "1:553678534542:web:009a39ef9ec9b20c9816df",
  measurementId: "G-R8M1L5SRM6"
};

// Fix: Use initializeApp directly
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- HELPERS ---

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string | any) => {
  if (!dateString) return '';
  // Handle Firestore Timestamp
  const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// --- FIRESTORE GENERIC CRUD (User Scoped) ---

export const getCollectionPath = (uid: string, path: string) => `users/${uid}/${path}`;

export const fetchCollection = async (uid: string, path: string, orderField?: string) => {
  let q = query(collection(db, getCollectionPath(uid, path)));
  if (orderField) {
    q = query(collection(db, getCollectionPath(uid, path)), orderBy(orderField, 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveDocument = async (uid: string, path: string, data: any, docId?: string) => {
  const fullPath = getCollectionPath(uid, path);
  if (docId) {
    await setDoc(doc(db, fullPath, docId), { ...data, updatedAt: Timestamp.now() }, { merge: true });
    return docId;
  } else {
    const docRef = await addDoc(collection(db, fullPath), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return docRef.id;
  }
};

export const deleteDocument = async (uid: string, path: string, docId: string) => {
  await deleteDoc(doc(db, getCollectionPath(uid, path), docId));
};
