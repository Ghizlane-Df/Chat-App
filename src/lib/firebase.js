import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbU-uZzAd276bmoP61cdVcL8GaKHkORew",
  authDomain: "chatapp-e0411.firebaseapp.com",
  projectId: "chatapp-e0411",
  storageBucket: "chatapp-e0411.firebasestorage.app",
  messagingSenderId: "648952236273",
  appId: "1:648952236273:web:d713240af508468da74150",
  measurementId: "G-RZQ3NC3BL3"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db};               // ← EXPORT
