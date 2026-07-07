import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config.js";

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

  // Ro'yxatdan o'tish
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
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
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}