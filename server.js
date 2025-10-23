import express from "express";
import { WebcastPushConnection } from "tiktok-live-connector";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
const wss = new WebSocketServer({ port: 8080 });

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
app.listen(3000, () => console.log("Server HTTP di port 3000"));
