import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
// Eslatma: secondaryAuth shu faylda mutlaqo mavjud bo'lishi shart!
import { auth, db, secondaryAuth } from "../firebase/config.js";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [cafeId, setCafeId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Foydalanuvchi ma'lumotlarini Firestore'dan olish (rol, kafe id va h.k.)
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setRole(data.role || null);
        setCafeId(data.cafeId || null);
        return data;
      } else {
        setRole(null);
        setCafeId(null);
        return null;
      }
    } catch (error) {
      console.error("Foydalanuvchi ma'lumotlarini olishda xatolik:", error);
      setRole(null);
      setCafeId(null);
      return null;
    }
  };

  // Ro'yxatdan o'tish (masalan, kafe direktori ro'yxatdan o'tganda)
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  };

  // XODIM YARATISH — Direktor panelidan yangi xodim qo'shish
  const registerStaff = async (email, password, extraData = {}) => {
    // Agar config'da secondaryAuth sozlangan bo'lmasa, xato bermasligi uchun tekshiruv
    if (!secondaryAuth) {
      console.error("secondaryAuth Firebase config faylida topilmadi!");
      throw new Error("Firebase secondaryAuth sozlanmagan.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Firestore'dagi "users" kolleksiyasiga yozish
      await setDoc(doc(db, "users", newUser.uid), {
        email,
        fullName: extraData.fullName || "",
        role: extraData.role || "waiter",
        cafeId: extraData.cafeId || cafeId, // joriy admin kafeId'si olinadi
        phone: extraData.phone || "",
        status: extraData.status || "active",
        createdAt: serverTimestamp(),
      });

      // Secondary app sessiyasini tozalash
      await signOut(secondaryAuth);

      return newUser;
    } catch (error) {
      console.error("Xodim yaratishda xatolik:", error);
      throw error;
    }
  };

  // Kirish
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const data = await fetchUserData(userCredential.user.uid);
    return data?.role || null;
  };

  // Chiqish
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setCafeId(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        setRole(null);
        setCafeId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    role,
    cafeId,
    loading,
    login,
    register,
    registerStaff,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}