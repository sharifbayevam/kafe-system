import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  PlusCircle, 
  ClipboardList, 
  LogOut,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const location = useLocation();
  
  // Sidebar qo'lda butunlay ochilgan yoki yopilganligini nazorat qilish uchun state
  const [isExpanded, setIsExpanded] = useState(false);

  // Admin uchun menyu linklari
  const adminLinks = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/menu", label: "Menyu boshqaruvi", icon: UtensilsCrossed },
    { path: "/admin/staff", label: "Xodimlar", icon: Users },
  ];

  // Ofitsiant uchun menyu linklari
  const waiterLinks = [
    { path: "/waiter/order", label: "Yangi buyurtma", icon: PlusCircle },
    { path: "/waiter/history", label: "Buyurtmalar", icon: ClipboardList },
  ];

  const menuLinks = role === "admin" ? adminLinks : role === "waiter" ? waiterLinks : [];
  const isActive = (path) => location.pathname === path;

  return (
    <div 
      // isExpanded true bo'lsa w-64 (keng), false bo'lsa w-20 (ixcham mini holatda) bo'ladi
      // hover:w-64 orqali sichqoncha ustiga borganda ham avtomatik silliq kengayadi
      className={`h-screen bg-[#8B4513] text-white flex flex-col justify-between p-4 shadow-xl shrink-0 transition-all duration-300 ease-in-out group fixed md:relative z-50 ${
        isExpanded ? "w-64" : "w-20 hover:w-64"
      }`}
    >
      <div>
        {/* Yuqori qism: Logotip va Ochish/Yopish tugmasi */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 py-4 mb-6 overflow-hidden">
          <div className="flex items-center gap-3 px-2">
            <UtensilsCrossed className="text-[#D4AF37] w-6 h-6 shrink-0" />
            <span className={`font-black text-sm tracking-wider text-[#FDFBF7] transition-opacity duration-200 whitespace-nowrap ${
              isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}>
              DASTURXON
            </span>
          </div>
          
          {/* Qo'shimcha: Istasa bosib qotirib qo'yadigan kichkina o'q tugmasi */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`hidden md:flex p-1 rounded-lg bg-black/20 text-[#D4AF37] hover:bg-black/40 transition-all ${
              !isExpanded ? "opacity-0 group-hover:opacity-100" : ""
            }`}
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Kichkina Profil qismi */}
        <div className="flex items-center gap-3 px-2 py-2 bg-black/10 rounded-xl mb-6 border border-white/5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#8B4513] font-black text-xs shrink-0 uppercase">
            {role ? role[0] : "U"}
          </div>
          <div className={`transition-opacity duration-200 whitespace-nowrap ${
            isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            <p className="text-[11px] text-amber-200/80 font-bold capitalize">{role === "waiter" ? "Ofitsiant" : "Admin"}</p>
            <p className="text-[10px] text-white/50">Onlayn</p>
          </div>
        </div>

        {/* Menyu Navigatsiyasi */}
        <nav className="space-y-2">
          {menuLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl text-xs font-bold transition-all relative group/link ${
                  isActive(link.path)
                    ? "bg-[#D4AF37] text-[#8B4513] shadow-md"
                    : "text-amber-100/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Ikonka har doim markazda chiroyli turadi */}
                <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover/link:scale-110" />
                
                {/* Yozuv faqat sidebar ochilganda yoki sichqoncha borganda ko'rinadi */}
                <span className={`transition-opacity duration-200 whitespace-nowrap ${
                  isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  {link.label}
                </span>

                {/* Kichkina tooltip: Sichqoncha borganda yozuv yonboshidan ham chiqib turishi uchun (ixtiyoriy go'zallik) */}
                {!isExpanded && (
                  <div className="absolute left-20 bg-[#8B4513] text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 pointer-events-none group-hover/link:opacity-100 transition-opacity duration-150 border border-white/10 whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Chiqish tugmasi */}
      <button
        onClick={logout}
        className="flex items-center gap-4 px-3 py-3 text-red-200 hover:bg-red-950/40 hover:text-red-400 rounded-xl text-xs font-bold transition-all w-full overflow-hidden"
      >
        <LogOut className="w-5 h-5 shrink-0 text-red-300" />
        <span className={`transition-opacity duration-200 whitespace-nowrap ${
          isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          Tizimdan chiqish
        </span>
      </button>
    </div>
  );
}