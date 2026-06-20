import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2Ib67m9wyKQEHh8uKnU7WzZBumD_Rj9I",
  authDomain: "expert-diapos.firebaseapp.com",
  projectId: "expert-diapos",
  storageBucket: "expert-diapos.firebasestorage.app",
  messagingSenderId: "323338047132",
  appId: "1:323338047132:web:abc054cf166ad8e75da759"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
