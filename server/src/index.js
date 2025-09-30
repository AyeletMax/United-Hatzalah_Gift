import express from "express";
import giftRoutes from "./routes/giftRoutes.js";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

app.use("/api/gifts", giftRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`[server] Server starting on port ${PORT}`);
  try {
    console.log("[server] Testing DB connection...");
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`[server] ✅ DB connection OK. Server running on port ${PORT}`);
  } catch (err) {
    console.error("[server] ❌ DB connection failed:");
    console.error("[server] Error:", err.message);
    console.error("[server] Code:", err.code);
    console.log("[server] Please check your Clever Cloud database status");
    process.exit(1);
  }
});
