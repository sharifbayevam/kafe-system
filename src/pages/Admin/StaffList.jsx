import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function StaffList() {
  const { cafeId } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [activeTab, setActiveTab] = useState("staff"); // staff, salary

  const [form, setForm] = useState({
    fullName: "",
    role: "waiter",
    phone: "",
    salary: "",
    status: "active",
  });

  useEffect(() => {
    if (!cafeId) return;

    const q = query(collection(db, "staff"), where("cafeId", "==", cafeId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStaff(data);
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
    setForm({
      fullName: person.fullName || "",
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

    if (!form.fullName || !form.phone) {
      alert("Iltimos, ism va telefon raqamini kiriting");
      return;
    }

    const staffData = {
      cafeId,
      fullName: form.fullName,
      role: form.role,
      phone: form.phone,
      salary: Number(form.salary) || 0,
      status: form.status,
    };

    try {
      if (editingStaff) {
        await updateDoc(doc(db, "staff", editingStaff.id), staffData);
      } else {
        await addDoc(collection(db, "staff"), {
          ...staffData,
          createdAt: new Date(),
          salaryHistory: [],
        });
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Xodimni saqlashda xatolik:", error);
      alert("Xatolik yuz berdi, qaytadan urinib ko'ring");
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm("Bu xodimni o'chirishga ishonchingiz komilmi?")) return;
    try {
      await deleteDoc(doc(db, "staff", staffId));
    } catch (error) {
      console.error("Xodimni o'chirishda xatolik:", error);
    }
  };

  const toggleStatus = async (person) => {
    try {
      await updateDoc(doc(db, "staff", person.id), {
        status: person.status === "active" ? "inactive" : "active",
      });
    } catch (error) {
      console.error("Holatni yangilashda xatolik:", error);
    }
  };

  const markSalaryPaid = async (person) => {
    try {
      const history = person.salaryHistory || [];
      await updateDoc(doc(db, "staff", person.id), {
        salaryHistory: [
          ...history,
          {
            amount: person.salary,
            date: new Date().toISOString(),
          },
        ],
      });
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-amber-800">Xodimlar</h1>
        <button
          onClick={openAddModal}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
        >
          + Xodim qo'shish
        </button>
      </div>

      {/* Tablar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "staff"
              ? "bg-amber-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Xodimlar ro'yxati
        </button>
        <button
          onClick={() => setActiveTab("salary")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "salary"
              ? "bg-amber-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Oyliklar
        </button>
      </div>

      {activeTab === "staff" && (
        <>
          {staff.length === 0 ? (
            <p className="text-gray-400 text-sm">Hozircha xodimlar yo'q</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staff.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-xl shadow border border-gray-100 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {person.fullName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {roleLabels[person.role] || person.role}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {person.phone}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        person.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {person.status === "active" ? "Faol" : "Nofaol"}
                    </span>
                  </div>

                  <p className="text-amber-700 font-bold mt-2">
                    {Number(person.salary).toLocaleString()} so'm/oy
                  </p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      onClick={() => openEditModal(person)}
                      className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => toggleStatus(person)}
                      className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                    >
                      {person.status === "active" ? "Ishdan bo'shatish" : "Qayta olish"}
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="text-xs px-3 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "salary" && (
        <div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100 mb-4">
            <p className="text-sm text-gray-500">Jami oylik xarajati</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {totalSalaries.toLocaleString()} so'm
            </p>
          </div>

          <div className="space-y-3">
            {staff.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow border border-gray-100 p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {person.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {roleLabels[person.role] || person.role} •{" "}
                    {Number(person.salary).toLocaleString()} so'm
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Oxirgi to'lov:{" "}
                    {person.salaryHistory?.length > 0
                      ? new Date(
                          person.salaryHistory[
                            person.salaryHistory.length - 1
                          ].date
                        ).toLocaleDateString()
                      : "Yo'q"}
                  </p>
                </div>
                <button
                  onClick={() => markSalaryPaid(person)}
                  className="text-xs px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  To'landi deb belgilash
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editingStaff ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  To'liq ism
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Masalan: Aliyev Vali"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lavozimi
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="waiter">Ofitsiant</option>
                  <option value="chef">Oshpaz</option>
                  <option value="cashier">Kassir</option>
                  <option value="admin">Direktor</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Telefon raqami
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Oylik maoshi (so'm)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Masalan: 3000000"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
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