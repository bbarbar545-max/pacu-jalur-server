import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

process.env.TIKTOK_SIGN_SERVER = "https://tiktok.euler.mirror.ninja/api/sign";

const app = express();
app.use(cors());

// 🔧 Buat HTTP server manual dari Express (penting!)
const server = http.createServer(app);

// 🔗 Attach WebSocketServer ke server HTTP
const wss = new WebSocketServer({ server });

// Jalankan server di port Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server aktif di port ${PORT}`);
});

// Ganti username TikTok kamu di sini
const tiktokUsername = "kingtanjar";

// Koneksi ke TikTok Live
const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect()
  .then((state) => console.log("✅ Terhubung ke TikTok Live:", state.roomId))
  .catch((err) => console.error("❌ Gagal konek ke TikTok:", err));

// Saat gift diterima
tiktok.on("gift", (data) => {
  console.log(`${data.uniqueId} kirim gift: ${data.giftName}`);
  const giftData = { gift: data.giftName };
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(giftData));
  });
});

// Cek HTTP route biasa
app.get("/", (req, res) => {
  res.send("✅ Server TikTok Live aktif dan WebSocket siap!");
});
