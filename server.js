const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory donation history (for a real app, use a database)
const donations = [];
// Tomoshabinlar yuborgan, hali tasdiqlanmagan so'rovlar
const pending = [];

// --- 1) Tomoshabin karta orqali pul o'tkazgach, shu yerda ism/summa/xabar qoldiradi ---
// Bu ENDI ekranga to'g'ridan-to'g'ri chiqmaydi — avval admin panelga "kutayotgan" bo'lib tushadi.
app.post("/api/pending", (req, res) => {
  const { name, amount, message } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ error: "Ism va summa kiritilishi shart" });
  }

  const item = {
    id: Date.now(),
    name: name.slice(0, 40),
    amount: Number(amount),
    message: (message || "").slice(0, 200),
    createdAt: new Date().toISOString(),
  };

  pending.push(item);

  // Admin panelga real-vaqtda xabar berish
  io.emit("new-pending", item);

  res.json({ success: true });
});

app.get("/api/pending", (req, res) => {
  res.json(pending.slice().reverse());
});

// --- Admin panel "Tasdiqlash" tugmasini bosganda shu chaqiriladi ---
app.post("/api/approve/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = pending.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Topilmadi" });
  }

  const [item] = pending.splice(idx, 1);
  donations.push(item);

  io.emit("new-donation", item);   // Overlay'ga
  io.emit("pending-removed", id);  // Admin panelidan olib tashlash

  res.json({ success: true });
});

app.post("/api/reject/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = pending.findIndex((p) => p.id === id);
  if (idx !== -1) pending.splice(idx, 1);
  io.emit("pending-removed", id);
  res.json({ success: true });
});

// --- 2) Admin qo'lda kiritganda (masalan, Telegram orqali xabar kelgan holatlar uchun) ---
app.post("/api/donate", (req, res) => {
  const { name, amount, message } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ error: "Ism va summa kiritilishi shart" });
  }

  const donation = {
    id: Date.now(),
    name: name.slice(0, 40),
    amount: Number(amount),
    message: (message || "").slice(0, 200),
    createdAt: new Date().toISOString(),
  };

  donations.push(donation);

  // --- 2) Overlay sahifasiga real-vaqt xabar yuborish ---
  io.emit("new-donation", donation);

  res.json({ success: true, donation });
});

app.get("/api/donations", (req, res) => {
  res.json(donations.slice(-20).reverse());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`Donat sahifa (tomoshabin uchun): http://localhost:${PORT}/donate.html`);
  console.log(`Boshqaruv paneli (siz uchun):    http://localhost:${PORT}/admin.html`);
  console.log(`OBS overlay:                     http://localhost:${PORT}/overlay.html`);
});
