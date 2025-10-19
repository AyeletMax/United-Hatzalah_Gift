import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ====== ✅ CORS ======
app.use(cors({
  origin: ["https://hatzalah-gift.netlify.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ====== ✅ Request Logging ======
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ====== ✅ Static Files ======
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ====== ✅ Routes ======
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/catalogs", catalogRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/upload", uploadRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Simple upload route for testing
app.post('/api/upload/image', (req, res) => {
  res.json({ imageUrl: '/uploads/test-image.jpg' });
});

// ====== ✅ Error Handler ======
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// ====== ✅ Graceful Shutdown ======
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

// ====== ✅ DB Connection Check ======
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
