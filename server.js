import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";
import { WebSocketServer } from "ws";
import cors from "cors";

process.env.TIKTOK_SIGN_SERVER = "https://tiktok.euler.mirror.cafe/api/sign";

const app = express();
app.use(cors());

// Gunakan port otomatis dari Railway (biasanya 3000)
const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server HTTP di port ${process.env.PORT || 3000}`)
);

// Gunakan port yang sama untuk WebSocket
const wss = new WebSocketServer({ server });

// Ganti username TikTok kamu di sini (tanpa @)
const tiktokUsername = "kingtanjar";

const tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().then((state) => {
  console.log("✅ Terhubung ke TikTok Live:", state.roomId);
}).catch((err) => {
  console.error("❌ Gagal konek ke TikTok:", err);
});

tiktok.on("gift", (data) => {
  console.log(`${data.uniqueId} kirim gift: ${data.giftName}`);
  const giftData = { gift: data.giftName };
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(giftData));
  });
});

app.get("/", (req, res) => res.send("✅ Server TikTok Live aktif!"));
