import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserX, 
  UserCheck, 
  DollarSign, 
  CheckCircle, 
  Key, 
  Mail, 
  Phone, 
  Briefcase,
  RefreshCw,
  Wallet
} from "lucide-react";

export default function StaffList() {
  const { cafeId, registerStaff } = useAuth(); // registerStaff funksiyasi context'dan olindi
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [activeTab, setActiveTab] = useState("staff");

  const [form, setForm] = useState({
    fullName: "",
    username: "", // Email o'rniga direktor tushunadigan sodda username qilindi
    password: "",
    role: "waiter",
    phone: "",
    salary: "",
    status: "active",
  });

  useEffect(() => {
    if (!cafeId) return;

    const q = query(collection(db, "users"), where("cafeId", "==", cafeId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStaff(data.filter(u => u.role !== "bigadmin"));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cafeId]);

  const roleLabels = {
    waiter: "Ofitsiant",
    chef: "Oshpaz",
    cashier: "Kassir",
    admin: "Direktor",
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      username: "",
      password: "",
      role: "waiter",
      phone: "",
      salary: "",
      status: "active",
    });
    setEditingStaff(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (person) => {
    // Tahrirlashda foydalanuvchining emailidan @kafe.com qismini olib tashlab ko'rsatamiz
    const currentUsername = person.email ? person.email.split("@")[0] : "";
    
    setForm({
      fullName: person.fullName || "",
      username: currentUsername,
      password: person.password || "",
      role: person.role || "waiter",
      phone: person.phone || "",
      salary: person.salary || "",
      status: person.status || "active",
    });
    setEditingStaff(person);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.username || !form.password) {
      alert("Iltimos, barcha majburiy maydonlarni (Ism, Login, Parol, Telefon) kiriting");
      return;
    }

    // MUHIM JOYA: Direktor kiritgan sodda loginni orqasiga avtomat @kafe.com ulanadi
    const fullEmail = `${form.username.trim().toLowerCase()}@kafe.com`;

    const extraData = {
      cafeId,
      fullName: form.fullName,
      role: form.role,
      phone: form.phone,
      salary: Number(form.salary) || 0,
      status: form.status,
      // Tahrirlash paytida asoratsiz yangilanishi uchun parolni ham saqlaymiz
      password: form.password, 
    };

    try {
      if (editingStaff) {
        // Tahrirlash bo'lsa shunchaki Firestore'dagi hujjatini yangilaymiz
        await updateDoc(doc(db, "users", editingStaff.id), {
          ...extraData,
          email: fullEmail
        });
        alert("Xodim ma'lumotlari muvaffaqiyatli yangilandi!");
      } else {
        // Yangi xodim qo'shish bo'lsa Context'dagi registerStaff avtomat ham Auth'da ham Firestore'da ochadi!
        await registerStaff(fullEmail, form.password, extraData);
        alert("Yangi xodim muvaffaqiyatli qo'shildi!");
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Xodimni saqlashda xatolik:", error);
      alert("Xatolik yuz berdi! Ehtimol, bunday loginli xodim allaqachon mavjud yoki Firebase sozlamasi yoqilmagan.");
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm("Bu xodimni o'chirishga ishonchingiz komilmi? Tizimga kira olmay qoladi.")) return;
    try {
      await deleteDoc(doc(db, "users", staffId));
    } catch (error) {
      console.error("Xodimni o'chirishda xatolik:", error);
    }
  };

  const toggleStatus = async (person) => {
    try {
      await updateDoc(doc(db, "users", person.id), {
        status: person.status === "active" ? "inactive" : "active",
      });
    } catch (error) {
      console.error("Holatni yangilashda xatolik:", error);
    }
  };

  const markSalaryPaid = async (person) => {
    try {
      const history = person.salaryHistory || [];
      await updateDoc(doc(db, "users", person.id), {
        salaryHistory: [
          ...history,
          {
            amount: person.salary,
            date: new Date().toISOString(),
          },
        ],
      });
      alert(`${person.fullName} uchun oylik to'lovi muvaffaqiyatli belgilandi!`);
    } catch (error) {
      console.error("Oylik to'lovini belgilashda xatolik:", error);
    }
  };

  const totalSalaries = staff.reduce(
    (sum, p) => sum + (Number(p.salary) || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2">
        <RefreshCw className="text-amber-600 w-6 h-6 animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Xodimlar ro'yxati yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-[#FDFBF7] min-h-screen pb-24">
      {/* Sarlavha paneli */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-[#D4AF37] pb-3">
        <div className="flex items-center gap-2">
          <Users className="text-[#8B4513] w-6 h-6" />
          <h1 className="text-xl font-bold text-[#8B4513]">Xodimlar boshqaruvi</h1>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#B22222] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#8B0000] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Xodim qo'shish</span>
        </button>
      </div>

      {/* Tablar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "staff"
              ? "bg-[#8B4513] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Xodimlar ro'yxati</span>
        </button>
        <button
          onClick={() => setActiveTab("salary")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "salary"
              ? "bg-[#8B4513] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Oyliklar</span>
        </button>
      </div>

      {/* 1-TAB: Xodimlar Ro'yxati */}
      {activeTab === "staff" && (
        <>
          {staff.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-dashed">
              <p className="text-gray-400 text-sm">Hozircha xodimlar mavjud emas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staff.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{person.fullName}</h3>
                        <p className="text-[11px] text-amber-800 font-medium capitalize mt-0.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md inline-block">
                          {roleLabels[person.role] || person.role}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          person.status === "active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {person.status === "active" ? "Faol" : "Nofaol"}
                      </span>
                    </div>

                    <div className="space-y-1 mt-3 border-t pt-2 border-gray-50 text-xs text-gray-500">
                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {person.email}</p>
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {person.phone}</p>
                      <p className="text-[#B22222] font-extrabold text-sm pt-1">
                        {Number(person.salary).toLocaleString()} so'm / oy
                      </p>
                    </div>
                  </div>

                  {/* Amallar tugmalari */}
                  <div className="flex gap-1.5 mt-4 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => openEditModal(person)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-gray-600 transition flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      onClick={() => toggleStatus(person)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${
                        person.status === "active"
                          ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {person.status === "active" ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      <span>{person.status === "active" ? "Bloklash" : "Aktivlashtirish"}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium transition ml-auto flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>O'chirish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 2-TAB: Oylik To'lovlari Kontroli */}
      {activeTab === "salary" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Jami oylik xarajati</p>
              <p className="text-xl font-black text-green-600 mt-0.5">
                {totalSalaries.toLocaleString()} so'm
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {staff.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-gray-800 text-sm">{person.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {roleLabels[person.role] || person.role} • <span className="font-semibold text-gray-700">{Number(person.salary).toLocaleString()} so'm</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Oxirgi to'lov:{" "}
                    <span className="font-medium text-gray-600">
                      {person.salaryHistory?.length > 0
                        ? new Date(person.salaryHistory[person.salaryHistory.length - 1].date).toLocaleDateString()
                        : "To'lanmagan"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => markSalaryPaid(person)}
                  className="text-xs px-3 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-sm active:scale-95"
                >
                  To'landi deb belgilash
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Oyna */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 max-h-[95vh] overflow-y-auto border border-gray-100">
            <h2 className="text-base font-bold mb-4 text-gray-800 border-b pb-2">
              {editingStaff ? "📝 Xodim ma'lumotlarini tahrirlash" : "👤 Yangi xodim biriktirish"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">To'liq ism</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Ism va familiya"
                />
              </div>

              {/* Tizimga kirish Login qismi (Faqat Login so'zi yoziladi) */}
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-1">
                  <Mail className="w-3 h-3 text-gray-400" /> Xodim logini 
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    name="username"
                    disabled={!!editingStaff} // Tahrirlashda o'zgartirib bo'lmaydi
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] pr-24 disabled:bg-gray-50"
                    placeholder="login kiriting"
                  />
                  <span className="absolute right-3 text-xs text-gray-400 font-semibold select-none">
                  
                  </span>
                </div>
              </div>

              {/* Tizimga kirish Parol qismi */}
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-1">
                  <Key className="w-3 h-3 text-gray-400" /> Kirish paroli
                </label>
                <input
                  type="text"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Kamida 6 ta belgi"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-1">
                    <Briefcase className="w-3 h-3 text-gray-400" /> Lavozimi
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="waiter">Ofitsiant</option>
                    <option value="chef">Oshpaz</option>
                    <option value="cashier">Kassir</option>
                    <option value="admin">Direktor (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Telefon</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                    placeholder="+998901234567"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Oylik maoshi (so'm)</label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Xar oylik belgilangan maosh"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-[#B22222] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#8B0000] transition"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-200 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 text-gray-500 transition"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}