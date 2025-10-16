import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { pool } from "./db.js";

const app = express();

// ✅ הדפסת ה-Origin בפועל כדי לבדוק מה Netlify שולח
app.use((req, res, next) => {
  console.log("🔍 Origin from request:", req.headers.origin);
  next();
});

// ✅ CORS פשוט וברור
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://hatzalah-gift.netlify.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ נתיבי ה-API
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/catalogs", catalogRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/questions", questionRoutes);

// ✅ Middleware לשגיאות
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// ✅ סגירה מסודרת של חיבורי DB
process.on("SIGTERM", async () => {
  console.log("[server] SIGTERM received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[server] SIGINT received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});

// ✅ בדיקת חיבור למסד הנתונים
const connectWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[server] Testing DB connection... (attempt ${i + 1}/${retries})`);
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log(`[server] ✅ DB connection OK. Server running on port ${PORT}`);
      return true;
    } catch (err) {
      console.error(`[server] ❌ DB connection failed (attempt ${i + 1}):`, err.message);
      if (i === retries - 1) {
        console.error("[server] All connection attempts failed. Starting server without DB validation.");
        console.log(`[server] ⚠️ Server running on port ${PORT} (DB connection not verified)`);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

app.listen(PORT, async () => {
  console.log(`[server] Server starting on port ${PORT}`);
  await connectWithRetry();
});
