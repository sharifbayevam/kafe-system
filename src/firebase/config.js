import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqFkcef0rQlRRswa698On3DgNd6XdbvBs",
  authDomain: "kafe-boshqaruv-tizimi.firebaseapp.com",
  projectId: "kafe-boshqaruv-tizimi",
  storageBucket: "kafe-boshqaruv-tizimi.firebasestorage.app",
  messagingSenderId: "1045990593847",
  appId: "1:1045990593847:web:e823203f618bb5223bb6b2",
  measurementId: "G-PKJXQZ57JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);