// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4woqnOROBasPgRTOQ4vsg6zuKbcS0bUw",
  authDomain: "hcltech-a78ba.firebaseapp.com",
  projectId: "hcltech-a78ba",
  storageBucket: "hcltech-a78ba.firebasestorage.app",
  messagingSenderId: "525061166605",
  appId: "1:525061166605:web:9d8088ad13a9fee778a744",
  measurementId: "G-PME4NV1BEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
