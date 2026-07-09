import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const languages = [
  { code: "uz-latin", label: "UZ" },
  { code: "ru", label: "RU" }
];

export default function Sidebar() {
  const { i18n, t } = useTranslation();
  const { logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Tasdiqlash modali uchun holat
  const langRef = useRef(null);
  const location = useLocation();

  const currentLang = i18n.language || localStorage.getItem("appLang") || "uz-latin";

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (code) => {
    localStorage.setItem("appLang", code);
    i18n.changeLanguage(code);
    setLangOpen(false);
    window.location.reload();
  };

  // Chiqishni tasdiqlash funksiyasi
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      {/* PASTKI GORIZONTAL MOBIL MENYU */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#073024] text-white h-16 border-t border-emerald-950 z-40 flex items-center justify-around px-2 select-none">
        
        {/* 1. STOLLAR */}
        <Link
          to="/waiter/tables"
          className={`flex flex-col items-center justify-center w-20 h-full transition-all ${
            location.pathname.includes("tables")
              ? "text-amber-400 font-bold scale-105"
              : "text-emerald-100/60"
          }`}
        >
          <span className="text-xl">㗊</span>
          <span className="text-[10px] mt-0.5 truncate max-w-full">
            {t("tables_title") || "Stollar"}
          </span>
        </Link>

        {/* 2. YANGI BUYURTMA */}
        <Link
          to="/waiter/order"
          className={`flex flex-col items-center justify-center w-20 h-full transition-all ${
            location.pathname.includes("order")
              ? "text-amber-400 font-bold scale-105"
              : "text-emerald-100/60"
          }`}
        >
          <span className="text-xl">➕</span>
          <span className="text-[10px] mt-0.5 truncate max-w-full">
            {t("new_order_title") || "Yangi buyurtma"}
          </span>
        </Link>

        {/* 3. TIL TANLASH (TEPAGA QARAB OCHILADI) */}
        <div className="relative flex flex-col items-center justify-center w-20 h-full" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={`flex flex-col items-center justify-center w-full h-full text-emerald-100/60 transition-all ${
              langOpen ? "text-white" : ""
            }`}
          >
            <span className="text-xl">🌐</span>
            <span className="text-[10px] mt-0.5 uppercase font-bold">
              {languages.find((l) => l.code === currentLang)?.label || "UZ"}
            </span>
          </button>

          {langOpen && (
            <div className="absolute bottom-16 bg-[#073024] rounded-t-xl shadow-2xl border border-emerald-950 p-1 min-w-[70px] flex flex-col gap-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`px-3 py-2 text-xs rounded-lg text-center font-medium transition-colors ${
                    currentLang === lang.code
                      ? "text-amber-400 font-bold bg-emerald-900/40"
                      : "text-emerald-200 hover:bg-emerald-900/20"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. TIZIMDAN CHIQISH (MODALNI OCHADI) */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex flex-col items-center justify-center w-20 h-full text-emerald-100/60 hover:text-rose-400 transition-all cursor-pointer"
        >
          <span className="text-xl">↳</span>
          <span className="text-[10px] mt-0.5 truncate max-w-full">
            {t("close_window") || "Oynani yopish"}
          </span>
        </button>

      </div>

      {/* TIZIMDAN CHIQISHNI TASDIQLASH MODALI */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl text-center transform transition-all scale-100">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-rose-500 text-xl">🚪</span>
            </div>
            
            <h3 className="text-gray-800 font-bold text-base mb-1">
              Tizimdan chiqish
            </h3>
            <p className="text-gray-500 text-xs mb-5">
              Haqiqatan ham profilingizdan chiqmoqchimisz?
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmLogout}
                className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-rose-700 transition active:scale-95"
              >
                Ha, chiqish
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 transition active:scale-95"
              >
                Yo'q, qolish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}