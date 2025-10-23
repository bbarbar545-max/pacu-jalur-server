import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { WebcastPushConnection } from "tiktok-live-connector";

// 🪄 Mirror server TikTok biar konek stabil
process.env.TIKTOK_SIGN_SERVER = "https://tiktok.euler.mirror.ninja/api/sign";

// === EXPRESS APP ===
const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("✅ Server TikTok Live aktif dan WebSocket siap!"));

// === BUAT SERVER HTTP MANUAL ===
const server = http.createServer(app);

// === BUAT WEBSOCKET SERVER TANPA PORT TERPISAH ===
const wss = new WebSocketServer({ noServer: true });

// Tangani event upgrade (inilah kuncinya)
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

// === KONEKSI KE TIKTOK LIVE ===
const username = "kingtanjar"; // Ganti sesuai username kamu
const tiktok = new WebcastPushConnection(username);

tiktok
  .connect()
  .then((state) => console.log("✅ Terhubung ke TikTok Live:", state.roomId))
  .catch((err) => console.error("❌ Gagal konek ke TikTok:", err));

// Saat gift diterima dari TikTok
tiktok.on("gift", (data) => {
  console.log(`${data.uniqueId} kirim gift: ${data.giftName}`);
  const giftData = { gift: data.giftName };

  // Kirim ke semua klien WebSocket
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(giftData));
    }
  });
});

// === JALANKAN SERVER DI PORT RAILWAY ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server aktif di port ${PORT}`);
});
