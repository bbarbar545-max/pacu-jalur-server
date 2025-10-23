import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";
import { WebSocketServer } from "ws";
import cors from "cors";

process.env.TIKTOK_SIGN_SERVER = "https://tiktok.euler.mirror.ninja/api/sign";

const app = express();
app.use(cors());

// 🔧 Gunakan port otomatis dari Railway (biasanya 3000)
const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server HTTP di port ${process.env.PORT || 3000}`)
);

// 🔗 WebSocket di port yang sama
const wss = new WebSocketServer({ server });

// 🧠 Username TikTok kamu (tanpa @)
const tiktokUsername = "kingtanjar";

// 🎥 Koneksi TikTok Live
const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect()
  .then((state) => console.log("✅ Terhubung ke TikTok Live:", state.roomId))
  .catch((err) => console.error("❌ Gagal konek ke TikTok:", err));

// 🎁 Saat gift diterima
tiktok.on("gift", (data) => {
  console.log(`${data.uniqueId} kirim gift: ${data.giftName}`);
  const giftData = { gift: data.giftName };
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(giftData));
  });
});

app.get("/", (req, res) => res.send("✅ Server TikTok Live aktif!"));
