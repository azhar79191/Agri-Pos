export const initialTransactions = [
  {
    id: "INV-001",
    date: "2026-02-11",
    time: "09:30:15",
    customerId: 1,
    customerName: "Muhammad Ali",
    items: [
      { productId: 1, name: "Roundup Herbicide", quantity: 2, price: 450, total: 900 },
      { productId: 4, name: "Urea Fertilizer", quantity: 10, price: 180, total: 1800 }
    ],
    subtotal: 2700,
    tax: 135,
    discount: 0,
    grandTotal: 2835,
    paymentMethod: "Cash",
    status: "Completed"
  },
  {
    id: "INV-002",
    date: "2026-02-11",
    time: "10:15:42",
    customerId: 2,
    customerName: "Ahmed Hassan",
    items: [
      { productId: 5, name: "Hybrid Tomato Seeds", quantity: 3, price: 850, total: 2550 },
      { productId: 9, name: "NPK 20-20-20 Fertilizer", quantity: 5, price: 420, total: 2100 }
    ],
    subtotal: 4650,
    tax: 232.5,
    discount: 100,
    grandTotal: 4782.5,
    paymentMethod: "Online Transfer",
    status: "Completed"
  },
  {
    id: "INV-003",
    date: "2026-02-11",
    time: "11:45:20",
    customerId: 3,
    customerName: "Tariq Mahmood",
    items: [
      { productId: 2, name: "Malathion Insecticide", quantity: 1, price: 320, total: 320 },
      { productId: 3, name: "Dithane Fungicide", quantity: 2, price: 280, total: 560 },
      { productId: 14, name: "DAP Fertilizer", quantity: 5, price: 550, total: 2750 }
    ],
    subtotal: 3630,
    tax: 181.5,
    discount: 0,
    grandTotal: 3811.5,
    paymentMethod: "Credit",
    status: "Completed"
  },
  {
    id: "INV-004",
    date: "2026-02-10",
    time: "14:20:10",
    customerId: 4,
    customerName: "Shahid Afridi",
    items: [
      { productId: 12, name: "Imidacloprid Insecticide", quantity: 1, price: 650, total: 650 },
      { productId: 18, name: "Sulfur Fungicide", quantity: 3, price: 190, total: 570 }
    ],
    subtotal: 1220,
    tax: 61,
    discount: 20,
    grandTotal: 1261,
    paymentMethod: "Cash",
    status: "Completed"
  },
  {
    id: "INV-005",
    date: "2026-02-10",
    time: "16:30:05",
    customerId: 5,
    customerName: "Imran Khan",
    items: [
      { productId: 10, name: "Hybrid Cotton Seeds", quantity: 2, price: 1200, total: 2400 },
      { productId: 19, name: "Potash Fertilizer", quantity: 8, price: 380, total: 3040 }
    ],
    subtotal: 5440,
    tax: 272,
    discount: 150,
    grandTotal: 5562,
    paymentMethod: "Online Transfer",
    status: "Completed"
  },
  {
    id: "INV-006",
    date: "2026-02-09",
    time: "09:00:30",
    customerId: 6,
    customerName: "Wasim Akram",
    items: [
      { productId: 7, name: "2,4-D Herbicide", quantity: 2, price: 290, total: 580 },
      { productId: 11, name: "Glyphosate Herbicide", quantity: 1, price: 380, total: 380 }
    ],
    subtotal: 960,
    tax: 48,
    discount: 0,
    grandTotal: 1008,
    paymentMethod: "Cash",
    status: "Completed"
  },
  {
    id: "INV-007",
    date: "2026-02-09",
    time: "11:15:55",
    customerId: 7,
    customerName: "Babar Azam",
    items: [
      { productId: 15, name: "Hybrid Chilli Seeds", quantity: 2, price: 720, total: 1440 },
      { productId: 13, name: "Carbendazim Fungicide", quantity: 1, price: 480, total: 480 }
    ],
    subtotal: 1920,
    tax: 96,
    discount: 50,
    grandTotal: 1966,
    paymentMethod: "Credit",
    status: "Completed"
  },
  {
    id: "INV-008",
    date: "2026-02-08",
    time: "15:45:18",
    customerId: 8,
    customerName: "Shoaib Malik",
    items: [
      { productId: 6, name: "Chlorpyrifos Insecticide", quantity: 1, price: 520, total: 520 },
      { productId: 8, name: "Mancozeb Fungicide", quantity: 2, price: 340, total: 680 },
      { productId: 4, name: "Urea Fertilizer", quantity: 15, price: 180, total: 2700 }
    ],
    subtotal: 3900,
    tax: 195,
    discount: 0,
    grandTotal: 4095,
    paymentMethod: "Online Transfer",
    status: "Completed"
  },
  {
    id: "INV-009",
    date: "2026-02-08",
    time: "17:20:40",
    customerId: 9,
    customerName: "Sarfraz Ahmed",
    items: [
      { productId: 17, name: "Thiamethoxam Insecticide", quantity: 2, price: 780, total: 1560 },
      { productId: 20, name: "Hybrid Brinjal Seeds", quantity: 3, price: 580, total: 1740 }
    ],
    subtotal: 3300,
    tax: 165,
    discount: 100,
    grandTotal: 3365,
    paymentMethod: "Cash",
    status: "Completed"
  },
  {
    id: "INV-010",
    date: "2026-02-07",
    time: "10:30:25",
    customerId: 10,
    customerName: "Fakhar Zaman",
    items: [
      { productId: 16, name: "Atrazine Herbicide", quantity: 2, price: 260, total: 520 },
      { productId: 9, name: "NPK 20-20-20 Fertilizer", quantity: 10, price: 420, total: 4200 }
    ],
    subtotal: 4720,
    tax: 236,
    discount: 0,
    grandTotal: 4956,
    paymentMethod: "Credit",
    status: "Completed"
  },
  {
    id: "INV-011",
    date: "2026-02-07",
    time: "13:10:15",
    customerId: 11,
    customerName: "Hasan Ali",
    items: [
      { productId: 1, name: "Roundup Herbicide", quantity: 1, price: 450, total: 450 },
      { productId: 2, name: "Malathion Insecticide", quantity: 2, price: 320, total: 640 }
    ],
    subtotal: 1090,
    tax: 54.5,
    discount: 0,
    grandTotal: 1144.5,
    paymentMethod: "Cash",
    status: "Completed"
  },
  {
    id: "INV-012",
    date: "2026-02-06",
    time: "16:45:30",
    customerId: 12,
    customerName: "Shadab Khan",
    items: [
      { productId: 3, name: "Dithane Fungicide", quantity: 3, price: 280, total: 840 },
      { productId: 5, name: "Hybrid Tomato Seeds", quantity: 2, price: 850, total: 1700 },
      { productId: 14, name: "DAP Fertilizer", quantity: 5, price: 550, total: 2750 }
    ],
    subtotal: 5290,
    tax: 264.5,
    discount: 200,
    grandTotal: 5354.5,
    paymentMethod: "Online Transfer",
    status: "Completed"
  }
];
