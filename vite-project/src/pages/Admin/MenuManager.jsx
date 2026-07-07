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
import { 
  Image as LucideImage, 
  Plus, 
  Trash2, 
  Edit, 
  ClipboardList, 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from "lucide-react";

export default function MenuManager() {
  const { cafeId } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "taom",
    price: "",
    description: "",
    imageUrl: "",
    available: true,
  });

  useEffect(() => {
    if (!cafeId) return;

    const q = query(collection(db, "menu"), where("cafeId", "==", cafeId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setDishes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cafeId]);

  const resetForm = () => {
    setForm({
      name: "",
      category: "taom",
      price: "",
      description: "",
      imageUrl: "",
      available: true,
    });
    setEditingDish(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (dish) => {
    setForm({
      name: dish.name || "",
      category: dish.category || "taom",
      price: dish.price || "",
      description: dish.description || "",
      imageUrl: dish.imageUrl || "",
      available: dish.available ?? true,
    });
    setEditingDish(dish);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Rasm hajmi juda katta! Iltimos, 1 MB dan kichik rasm yuklang.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        imageUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      alert("Iltimos, taom nomi va narxini kiriting");
      return;
    }

    const dishData = {
      cafeId,
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      imageUrl: form.imageUrl,
      available: form.available,
    };

    try {
      if (editingDish) {
        await updateDoc(doc(db, "menu", editingDish.id), dishData);
      } else {
        await addDoc(collection(db, "menu"), {
          ...dishData,
          createdAt: new Date(),
        });
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Taomni saqlashda xatolik:", error);
      alert("Xatolik yuz berdi, qaytadan urinib ko'ring");
    }
  };

  const handleDelete = async (dishId) => {
    if (!window.confirm("Bu taomni o'chirishga ishonchingiz komilmi?")) return;
    try {
      await deleteDoc(doc(db, "menu", dishId));
    } catch (error) {
      console.error("Taomni o'chirishda xatolik:", error);
    }
  };

  const toggleAvailability = async (dish) => {
    try {
      await updateDoc(doc(db, "menu", dish.id), {
        available: !dish.available,
      });
    } catch (error) {
      console.error("Holatni yangilashda xatolik:", error);
    }
  };

  const categories = ["taom", "desert", "ichimlik", "salat", "boshqa"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2">
        <RefreshCw className="text-gray-400 w-5 h-5 animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loyha menyusi yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-[#FDFBF7] min-h-screen pb-24">
      {/* Sarlavha paneli */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-[#D4AF37] pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-[#8B4513] w-6 h-6" />
          <h1 className="text-xl font-bold text-[#8B4513]">Menyu boshqaruvi</h1>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#B22222] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#8B0000] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Taom</span>
        </button>
      </div>

      {/* Taomlar ro'yxati */}
      {dishes.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl border border-dashed flex flex-col items-center justify-center gap-2">
          <FileText className="text-gray-300 w-8 h-8" />
          <p className="text-gray-400 text-sm">Hozircha menyuda taomlar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex transition-all hover:shadow-md"
            >
              <img
                src={dish.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60"}
                alt={dish.name}
                className="w-24 h-full object-cover bg-gray-50 min-h-[100px]"
              />
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{dish.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        dish.available
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {dish.available ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Mavjud</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Tugagan</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 capitalize mt-0.5">{dish.category}</p>
                  <p className="text-[#B22222] font-extrabold text-sm mt-1">
                    {Number(dish.price).toLocaleString()} so'm
                  </p>
                </div>
                
                {/* Tugmalar */}
                <div className="flex gap-1.5 mt-3 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => openEditModal(dish)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-gray-600 transition flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => toggleAvailability(dish)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                      dish.available 
                        ? "border-amber-200 text-amber-700 hover:bg-amber-50" 
                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    {dish.available ? "Tugatish" : "Tiklash"}
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 font-medium transition ml-auto flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal oyna */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              {editingDish ? (
                <Edit className="text-gray-700 w-5 h-5" />
              ) : (
                <PlusCircle className="text-gray-700 w-5 h-5" />
              )}
              <h2 className="text-base font-bold text-gray-800">
                {editingDish ? "Taomni tahrirlash" : "Yangi taom qo'shish"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Taom nomi</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Masalan: Somsa, Shashlik"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Kategoriya</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#D4AF37] capitalize"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Narxi (so'm)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                    placeholder="35000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Tavsif (ixtiyoriy)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Taom tarkibi haqida ma'lumot..."
                />
              </div>

              {/* Rasm yuklash bo'limi */}
              <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50/50">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-2 mb-1 cursor-pointer">
                  <LucideImage size={16} className="text-gray-500" />
                  <span>Rasm yuklash (Galereyadan)</span>
                </label>            
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                />
                
                <div className="text-center my-2 text-[10px] text-gray-400 font-bold">— YOKI LINK QO'YISH —</div>
                
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl && !form.imageUrl.startsWith("data:image") ? form.imageUrl : ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37]"
                  placeholder="https://images.unsplash.com/... (ixtiyoriy)"
                />

                {/* Tanlangan rasmning kichik ko'rinishi (Preview) */}
                {form.imageUrl && (
                  <div className="mt-2 flex items-center gap-2 bg-white p-1.5 rounded-lg border">
                    <img src={form.imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-md" />
                    <span className="text-[10px] text-green-600 font-medium">Rasm muvaffaqiyatli tanlandi!</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                  id="available"
                  className="w-4 h-4 accent-[#B22222]"
                />
                <label htmlFor="available" className="text-xs font-medium text-gray-700 select-none">
                  Ushbu taom hozir sotuvda mavjud
                </label>
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