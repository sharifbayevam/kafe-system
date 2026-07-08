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
import Sidebar from "../../components/Sidebar";

export default function Billing() {
  const { cafeId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("unpaid"); // unpaid, paid, all
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!cafeId) return;

    const q = query(
      collection(db, "orders"),
      where("cafeId", "==", cafeId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      data.sort((a, b) => {
        const ad = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const bd = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return bd - ad;
      });
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cafeId]);

  const markAsPaid = async (order, method) => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        paymentStatus: "paid",
        paymentMethod: method,
        paidAt: new Date(),
      });
      setSelectedOrder(null);
    } catch (error) {
      console.error("To'lovni belgilashda xatolik:", error);
      alert("Xatolik yuz berdi, qaytadan urinib ko'ring");
    }
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    if (filter === "unpaid")
      return orders.filter((o) => o.paymentStatus !== "paid");
    if (filter === "paid")
      return orders.filter((o) => o.paymentStatus === "paid");
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const getDailyStats = () => {
    const now = new Date();
    const todayOrders = orders.filter((o) => {
      if (o.paymentStatus !== "paid") return false;
      const d = o.paidAt?.toDate ? o.paidAt.toDate() : new Date(o.paidAt || 0);
      return d.toDateString() === now.toDateString();
    });
    const cash = todayOrders
      .filter((o) => o.paymentMethod === "cash")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const card = todayOrders
      .filter((o) => o.paymentMethod === "card")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return {
      total: cash + card,
      cash,
      card,
      count: todayOrders.length,
    };
  };

  const stats = getDailyStats();

  const formatDate = (date) => {
    const d = date?.toDate ? date.toDate() : new Date(date || 0);
    return d.toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex items-center justify-center h-64 w-full">
          <p className="text-gray-500 text-lg">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-amber-800 mb-4">Kassa</h1>

        {/* Kunlik statistika */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">Bugungi tushum</p>
            <p className="text-lg font-bold text-green-600">
              {stats.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">Naqd</p>
            <p className="text-lg font-bold text-amber-700">
              {stats.cash.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">Karta</p>
            <p className="text-lg font-bold text-blue-600">
              {stats.card.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">Cheklar soni</p>
            <p className="text-lg font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "unpaid", label: "To'lanmagan" },
            { key: "paid", label: "To'langan" },
            { key: "all", label: "Barchasi" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.key
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cheklar ro'yxati */}
        {filteredOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">Cheklar topilmadi</p>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow border border-gray-100 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Stol №{order.tableNumber || "-"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "To'langan" : "Kutilmoqda"}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>
                        {(item.price * item.quantity).toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-800">Jami:</span>
                  <span className="font-bold text-amber-700">
                    {Number(order.totalPrice || 0).toLocaleString()} so'm
                  </span>
                </div>

                {order.paymentStatus === "paid" ? (
                  <p className="text-xs text-gray-400 mt-2">
                    To'lov usuli:{" "}
                    {order.paymentMethod === "cash" ? "Naqd" : "Karta"}
                  </p>
                ) : (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full mt-3 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
                  >
                    To'lovni qabul qilish
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* To'lov usuli tanlash modali */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
              <h2 className="text-lg font-bold mb-1 text-gray-800">
                To'lov usulini tanlang
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Stol №{selectedOrder.tableNumber} —{" "}
                {Number(selectedOrder.totalPrice || 0).toLocaleString()} so'm
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => markAsPaid(selectedOrder, "cash")}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Naqd
                </button>
                <button
                  onClick={() => markAsPaid(selectedOrder, "card")}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Karta
                </button>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-2 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}