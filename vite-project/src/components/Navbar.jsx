import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const languages = [
  { code: "uz-latin", label: "O'zbek" },
  { code: "uz-cyrillic", label: "Ўзбек" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("uz-latin");

  const handleLangChange = (code) => {
    setCurrentLang(code);
    setLangOpen(false);
    // Bu yerda i18n util orqali tilni butun ilovaga tarqatish mumkin
    localStorage.setItem("appLang", code);
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
  };

  const roleLabels = {
    bigadmin: "Big Admin",
    admin: "Direktor",
    waiter: "Ofitsiant",
    chef: "Oshpaz",
    cashier: "Kassir",
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-md sticky top-0 z-50">
      {/* Logotip va nom */}
      <div className="flex items-center gap-2">
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="h-8 w-8"
        />
        <span className="font-bold text-lg text-amber-800 hidden sm:block">
          Dasturxon
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Til tanlash */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition"
          >
            {languages.find((l) => l.code === currentLang)?.label}
            <svg
              className={`w-4 h-4 transition-transform ${
                langOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition ${
                    currentLang === lang.code
                      ? "bg-amber-100 font-semibold"
                      : ""
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {roleLabels[role] || "Foydalanuvchi"}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {roleLabels[role] || "Foydalanuvchi"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}