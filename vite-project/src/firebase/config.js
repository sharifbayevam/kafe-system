import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqFkcef0rQlRRswa698On3DgNd6XdbvBs",
  authDomain: "kafe-boshqaruv-tizimi.firebaseapp.com",
  projectId: "kafe-boshqaruv-tizimi",
  storageBucket: "kafe-boshqaruv-tizimi.firebasestorage.app",
  messagingSenderId: "1045990593847",
  appId: "1:1045990593847:web:e823203f618bb5223bb6b2",
  measurementId: "G-PKJXQZ57JX"
};

// Asosiy ilovani ishga tushirish
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Admin (Direktor) sessiyasi buzilmasligi uchun ikkinchi ilovani ochamiz
const secondaryApp = initializeApp(firebaseConfig, "Secondary");

// Eksport qilinadigan obyektlar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const secondaryAuth = getAuth(secondaryApp); // MANA SHU QATOR XATONI TUZATADI!