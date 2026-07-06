import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from './Button';

export default function Navbar() {
  const { user, role, logout } = useContext(AuthContext);
  const [currentLang, setCurrentLang] = useState('UZ'); // UZ, ЎЗ, RU, EN
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 4 ta til uchun lug'at (Ilova talabiga ko'ra)
  const languages = [
    { code: 'UZ', label: 'O\'zbekcha' },
    { code: 'ЎЗ', label: 'Ўзбекча' },
    { code: 'RU', label: 'Русский' },
    { code: 'EN', label: 'English' }
  ];

  // Rollarga qarab o'zbekona milliy ranglar palitrasi va ikonkalari
  const roleStyles = {
    BigAdmin: { text: 'Tizim Rahbari', color: 'bg-purple-600 text-purple-100 border-purple-400', icon: '👑' },
    Admin: { text: 'Kafe Direktori', color: 'bg-emerald-600 text-emerald-100 border-emerald-400', icon: '🏛️' },
    Waiter: { text: 'Ofitsiant', color: 'bg-cyan-600 text-cyan-100 border-cyan-400', icon: '💁‍♂️' },
    Chef: { text: 'Oshpaz', color: 'bg-amber-600 text-amber-100 border-amber-400', icon: '👨‍🍳' },
    Cashier: { text: 'Kassir', color: 'bg-rose-600 text-rose-100 border-rose-400', icon: '💰' },
  };

  const currentRole = roleStyles[role] || { text: 'Xodim', color: 'bg-gray-600 text-gray-100', icon: '👤' };

  return (
    <>
      {/* Asosiy Navbar — Mobil qurilmalar uchun yuqorida qotirilgan */}
      <nav className="fixed top-0 left-0 right-0 max-w-md mx-auto h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 px-4 flex items-center justify-between shadow-sm">
        
        {/* Chap tomon: Milliy ornament simvollari bilan bezatilgan logotip */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl font-serif shadow-md shadow-emerald-900/10 border border-emerald-500/20 relative overflow-hidden">
            {/* Orqa fondagi milliy naqsh effekti */}
            <div className="absolute inset-0 opacity-10 uppercase font-mono text-[6px] leading-none p-1 pointer-events-none">
              ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖
            </div>
            <span className="relative z-10 font-bold">{currentRole.icon}</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-800 tracking-tight leading-none">Smart Cafe</h1>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">Tizim v2.5</span>
          </div>
        </div>

        {/* O'ng tomon: Til almashtirish va Profil boshqaruvi */}
        <div className="flex items-center gap-2">
          
          {/* 1. Til tanlash tugmasi */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(isMenuOpen === 'lang' ? null : 'lang')}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl text-gray-700 active:scale-95 transition-all flex items-center gap-1"
            >
              🇺🇿 {currentLang}
            </button>

            {isMenuOpen === 'lang' && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setIsMenuOpen(null);
                      // Bu yerda i18n yoki til o'zgartirish funksiyasi chaqiriladi
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      currentLang === lang.code ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Profil va Rol tugmasi */}
          <button
            onClick={() => setIsMenuOpen(isMenuOpen === 'profile' ? null : 'profile')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all active:scale-95 ${currentRole.color}`}
          >
            <span className="text-xs font-bold tracking-wide">{currentRole.text}</span>
            <svg className="w-3 h-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

        </div>

        {/* Profil Dropdown (Oynasi) */}
        {isMenuOpen === 'profile' && (
          <>
            {/* Orqa fonni yopish uchun shaffof qatlam */}
            <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsMenuOpen(null)} />
            
            <div className="absolute top-14 right-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                  {user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400 font-medium">Xodim profili:</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Chiqish tugmasi (Loyiha tarkibidagi Button komponenti) */}
              <Button
                variant="danger"
                size="sm"
                className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                onClick={() => {
                  setIsMenuOpen(null);
                  logout();
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Tizimdan chiqish</span>
              </Button>
            </div>
          </>
        )}
      </nav>

      {/* Navbardan keyingi sahifalar Navbar ostida qolib ketmasligi uchun bo'sh joy (Spacer) */}
      <div className="h-16" />
    </>
  );
}z