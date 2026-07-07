import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify"; // Xabarnomalar ulandi

export default function KitchenQueue() {
  const { cafeId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Oshxona navbatini real-time tinglash va tartiblash (FIFO)
  useEffect(() => {
    if (!cafeId) return;

    const q = query(
      collection(db, "orders"),
      where("cafeId", "==", cafeId),
      where("kitchenStatus", "in", ["pending", "preparing"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Birinchi kelgan buyurtma tepada turadi (FIFO)
      data.sort((a, b) => {
        const ad = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        const bd = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
        return ad - bd;
      });

      // Yangi buyurtma kelganini aniqlash va bildirishnoma yuborish
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newOrder = change.doc.data();
          
          // Oshpazga yangi buyurtma signali
          toast.info(`🔔 Yangi buyurtma! Stol №${newOrder.tableNumber || "-"}`, {
            position: "top-right",
            style: { backgroundColor: '#2563eb', color: '#FFF' }
          });

          // Yangi buyurtma uchun qisqa ovozli effekt
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
          audio.play().catch((e) => console.log("Ovoz ruxsati yo'q: ", e));
        }
      });

      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cafeId]);

  // 2. Tayyorlashni boshlash mantiqi
  const startPreparing = async (order) => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        kitchenStatus: "preparing",
        preparingAt: new Date(),
      });
      toast.dark(`👨‍🍳 Stol №${order.tableNumber} tayyorlanmoqda...`);
    } catch (error) {
      console.error("Statusni yangilashda xatolik:", error);
    }
  };

  // 3. Buyurtmani tayyor deb belgilash (Bu ofitsiant ekranida signal beradi)
  const markReady = async (order) => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        kitchenStatus: "ready",
        readyAt: new Date(),
        waiterNotified: false,
      });
      toast.success(`✓ Stol №${order.tableNumber} buyurtmasi tayyorlandi!`);
    } catch (error) {
      console.error("Tayyor deb belgilashda xatolik:", error);
    }
  };

  const getElapsedMinutes = (createdAt) => {
    const created = createdAt?.toDate
      ? createdAt.toDate()
      : new Date(createdAt || 0);
    const diffMs = new Date() - created;
    return Math.floor(diffMs / 60000);
  };

  const formatTime = (date) => {
    const d = date?.toDate ? date.toDate() : new Date(date || 0);
    return d.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-amber-800">
          Oshxona navbati
        </h1>
        <span className="text-sm text-gray-500 font-bold">
          {orders.length} ta faol buyurtma
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg font-medium">Hozircha buyurtmalar yo'q ☕</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isUrgent = elapsed >= 15; // 15 daqiqadan oshsa shoshilinch qizil rejim

            // Ofitsiant menyusidagidek chap va o'ngdan chiroyli suzib kirish effekti
            const animationClass = index % 2 === 0 ? "animate-fade-left" : "animate-fade-right";

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow border-2 p-4 transition-all ${animationClass} ${
                  index === 0
                    ? "border-amber-500 shadow-md scale-[1.01]"
                    : "border-gray-100"
                } ${isUrgent ? "ring-2 ring-red-400 bg-red-50/20" : ""}`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        Navbatda 1-chi
                      </span>
                    )}
                    <h3 className="font-bold text-gray-800 text-base">
                      Stol №{order.tableNumber || "-"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        order.kitchenStatus === "preparing"
                          ? "bg-blue-100 text-blue-700 animate-pulse"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {order.kitchenStatus === "preparing"
                        ? "Tayyorlanmoqda"
                        : "Kutilmoqda"}
                    </span>
                    <p
                      className={`text-xs mt-1.5 font-bold ${
                        isUrgent ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      {formatTime(order.createdAt)} • <span className="underline">{elapsed} daq.</span> o'tdi
                    </p>
                  </div>
                </div>

                {/* Buyurtma ichidagi taomlar ro'yxati */}
                <div className="mt-3 space-y-1">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:bg-gray-100/70 transition"
                    >
                      <span className="text-gray-700 font-bold">
                        {item.name}
                      </span>
                      <span className="text-gray-500 font-black">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ofitsiant qoldirgan maxsus izoh */}
                {order.note && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2 mt-2">
                    <p className="text-xs text-amber-900 italic font-medium">
                      ⚠️ Izoh: {order.note}
                    </p>
                  </div>
                )}

                {/* Harakat tugmalari */}
                <div className="mt-3">
                  {order.kitchenStatus === "pending" ? (
                    <button
                      onClick={() => startPreparing(order)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-[0.99] transition shadow-sm"
                    >
                      Tayyorlashni boshlash
                    </button>
                  ) : (
                    <button
                      onClick={() => markReady(order)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 active:scale-[0.99] transition shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>Tayyor ✓</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}