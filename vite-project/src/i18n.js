import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "uz-latin": {
    translation: {
      // Kassa va umumiy
      cashier_system: "Kassa tizimi",
      unpaid: "To'lanmagan",
      paid: "To'langan",
      all: "Barchasi",
      today_total: "BUGUNGI JAMI TUSHUM",
      cash_payments: "NAQD TO'LOVLAR",
      card_payments: "KARTA ORQALI",
      closed_checks: "YOPILGAN CHEKLAR",
      table: "Stol",
      total_sum: "JAMI SUMMA:",
      process_payment: "To'lovni qabul qilish",
      discount: "Chegirma",
      final_total: "Yakuniy to'lov",
      cash: "Naqd",
      card: "Karta",
      close_window: "Oynani yopish",
      loading: "Yuklanmoqda...",
      waiting: "KUTILMOQDA",
      count_unit: "ta",

      // Waiter (Ofitsiant) qismi
      tables_title: "Stollar",
      new_order: "+ Yangi buyurtma",
      table_empty: "Bo'sh (bosilsa menyuga o'tadi)",
      table_busy: "Band",
      table_ready: "Taom tayyor",
      no_tables_added: "Hozircha stollar qo'shilmagan",
      new_order_title: "Yangi buyurtma",
      table_number_label: "Stol raqami",
      placeholder_table: "Masalan: 5",
      add_to_cart: "+ Qo'shish",
      product_sum: "Mahsulot",
      send_to_kitchen: "Yuborish",
      sending: "Yuborilmoqda...",
      close: "Yopish",
      order_sent_success: "🚀 Buyurtma oshxonaga yuborildi!",
      chef_ready_alert: "🔔 {{table}}-stol buyurtmasi tayyor! Oshpazdan olib ketishingiz mumkin.",

      // Kategoriyalar
      cat_all: "Barchasi",
      cat_meal: "taom",
      cat_dessert: "desert",
      cat_drink: "ichimlik",
      cat_salad: "salat",
      cat_other: "boshqa"
    }
  },
  ru: {
    translation: {
      cashier_system: "Кассовая система",
      unpaid: "Неоплаченные",
      paid: "Оплаченные",
      all: "Все",
      today_total: "ОБЩАЯ ВЫРУЧКА ЗА СЕГОДНЯ",
      cash_payments: "НАЛИЧНЫЕ ПЛАТЕЖИ",
      card_payments: "ПО КАРТЕ",
      closed_checks: "ЗАКРЫТЫЕ ЧЕКИ",
      table: "Стол",
      total_sum: "ОБЩАЯ СУММА:",
      process_payment: "Принять оплату",
      discount: "Скидка",
      final_total: "Итого к оплате",
      cash: "Наличные",
      card: "Карта",
      loading: "Загрузка...",
      waiting: "ОЖИДАЕТСЯ",
      count_unit: "шт",

      tables_title: "Столы",
      new_order: "+ Новый заказ",
      table_empty: "Свободен (нажмите для меню)",
      table_busy: "Занят",
      table_ready: "Блюдо готово",
      no_tables_added: "Столы пока не добавлены",
      new_order_title: "Новый заказ",
      table_number_label: "Номер стола",
      placeholder_table: "Например: 5",
      add_to_cart: "+ Добавить",
      product_sum: "Продукт",
      send_to_kitchen: "Отправить",
      sending: "Отправка...",
      close: "Закрыть",
      order_sent_success: "🚀 Заказ отправлен на кухню!",
      chef_ready_alert: "🔔 Заказ для стола №{{table}} готов! Можете забрать у повара.",

      cat_all: "Все",
      cat_meal: "блюда",
      cat_dessert: "десерты",
      cat_drink: "напитки",
      cat_salad: "салаты",
      cat_other: "другое"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("appLang") || "uz-latin",
  fallbackLng: "uz-latin",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;