window.APP_CONFIG = {
  shopName: "นายบุ้นหลี ปอเปี๊ยะสด",
  shopSubtitle: "ต้นตำรับกว่า 50 ปี จองง่าย ไม่ต้องโทร",
  googleMapsUrl: "https://maps.app.goo.gl/mKDQsifSyT6BMvvZ7",
  deliveryUrl: "https://apiwattantipornanan-hue.github.io/Delivery_App_TH/UI_Jun_2026/index.html",
  lineOfficialAccountId: "@115utsxg",
  lineOfficialAccountUrl: "https://line.me/R/ti/p/@115utsxg",
  lineNotifications: {
    enabled: true,
    readyEndpoint: "/api/line-ready",
  },
  currency: "THB",
  capacityPerSlot: 12,
  pickupStart: "09:30",
  pickupEnd: "15:00",
  pickupIntervalMinutes: 30,
  customerDisabledSlots: ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
  dailyPageRefresh: {
    enabled: true,
    time: "08:55",
  },

  // Replace this before real launch. Use phone, national ID, or e-wallet PromptPay ID.
  promptPayId: "0867876813",

  // Keep false for a simpler customer experience. Turn on later if payment matching needs unique satang.
  useUniqueSatang: false,

  // Payment safety defaults. Keep API keys out of this public file.
  qrExpiresInMinutes: 15,
  paymentVerification: {
    enabled: false,
    verifyEndpoint: "/api/verify-slip",
    primaryProvider: "slipok",
    fallbackProvider: "easyslip",
  },

  products: [
    {
      id: "roll",
      name: "ปอเปี๊ยะสด",
      desc: "แยกน้ำจิ้มให้ ทำสดตามรอบ",
      price: 50,
      image: "../assets/fresh-roll.png",
      unitLabel: "ชุด",
      type: "product",
      capacityUnit: true,
    },
    {
      id: "roll_special",
      name: "ปอเปี๊ยะสด พิเศษ",
      desc: "ชุดพิเศษ อิ่มขึ้นอีกนิด",
      price: 60,
      image: "../assets/fresh-roll.png",
      unitLabel: "ชุด",
      type: "product",
      capacityUnit: true,
    },
    {
      id: "tofu",
      name: "เต้าหู้",
      desc: "",
      note: "มีน้ำเต้าหู้ด้วย",
      price: 20,
      image: "../assets/tofu.png",
      unitLabel: "ชุด",
      type: "product",
      capacityUnit: false,
    },
    {
      id: "sausage",
      name: "กุนเชียง",
      desc: "1 คู่ มี 2 เส้น",
      price: 60,
      image: "../assets/chinese-sausage.png",
      unitLabel: "คู่",
      type: "product",
      capacityUnit: false,
    },
  ],

  addOns: [
    {
      id: "mustard",
      name: "มัสตาร์ด",
      desc: "เพิ่มซอสมัสตาร์ด",
      price: 20,
      unitLabel: "รายการ",
      type: "add_on",
    },
  ],
};

window.FINAL_APP_FIREBASE_CONFIG = {
  enabled: true,
  firebaseConfig: {
    apiKey: "AIzaSyBiKVa5_xzkz_lpfj3XzZrvalyQf3-r1f8",
    authDomain: "bunlee-pickup-order.firebaseapp.com",
    projectId: "bunlee-pickup-order",
    storageBucket: "bunlee-pickup-order.firebasestorage.app",
    messagingSenderId: "708095396199",
    appId: "1:708095396199:web:70f83ed997aa1662f347c2",
    measurementId: "G-VVKXTKPE9Y",
  },
};
