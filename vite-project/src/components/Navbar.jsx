import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Globe, LogOut, ChevronDown } from "lucide-react"; // Chiroyli ikonkalardan foydalanamiz

const languages = [
  { code: "uz-latin", label: "O'zbekcha" },
  { code: "uz-cyrillic", label: "Ўзбекча" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem("appLang") || "uz-latin";
  });

  const langRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (code) => {
    setCurrentLang(code);
    setLangOpen(false);
    localStorage.setItem("appLang", code);
    window.location.reload();
  };

  const roleLabels = {
    bigadmin: "Big Admin",
    admin: "Direktor",
    waiter: "Ofitsiant",
    chef: "Oshpaz",
    cashier: "Kassir",
  };

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      
      {/* Chap tomon: Brend va Logotip (Och rangli premium uslub) */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <img
            src="/logo.jpg" 
            alt="Logo"
            className="h-5 w-5 object-contain invert"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <span className="font-semibold text-[15px] text-slate-900 tracking-tight">
          Gusto <span className="text-slate-400 font-normal text-xs ml-0.5">v1.0</span>
        </span>
      </div>

      {/* O'ng tomon: Interaktiv boshqaruvlar */}
      <div className="flex items-center gap-3">
        
        {/* 1. TIL TANLASH TUGMASI */}
        <div className="relative" ref={langRef} onMouseLeave={() => setLangOpen(false)}>
          <button
            onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}
            className="h-9 flex items-center gap-2 px-3 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-150"
          >
            <Globe size={14} className="text-slate-400" />
            {languages.find((l) => l.code === currentLang)?.label}
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors ${
                    currentLang === lang.code
                      ? "text-slate-900 font-semibold bg-slate-50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nafis ajratuvchi chiziq */}
        <div className="w-[1px] h-5 bg-slate-200" />

        {/* 2. PROFIL VA CHIQUVCHI TUGMA PANELI */}
        <div className="relative" ref={profileRef} onMouseLeave={() => setProfileOpen(false)}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
            className="h-9 flex items-center gap-2.5 pl-2 pr-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all duration-150"
          >
            <div className="w-6.5 h-6.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-bold uppercase shadow-sm">
              {user?.email?.charAt(0) || "U"}
            </div>
            <span className="text-[13px] font-medium text-slate-700 hidden sm:block">
              {user?.email ? user.email.split("@")[0] : "Foydalanuvchi"}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100/60 mb-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tizimdagi lavozim</p>
                <p className="text-[13px] font-medium text-slate-800 mt-0.5">
                  {roleLabels[role] || "Foydalanuvchi"}
                </p>
              </div>
              
              <button
                onClick={async () => { setProfileOpen(false); await logout(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 font-medium rounded-lg hover:bg-red-50/60 transition-colors"
              >
                <LogOut size={14} />
                Chiqish
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}