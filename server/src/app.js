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

// Handle preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.get('origin') || 'unknown'}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'United Hatzalah Gift Server is running!' });
});

app.get('/health', (req, res) => {
  console.log('[server] Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  console.log('[server] Test endpoint called');
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/catalogs", catalogRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/questions", questionRoutes);

// Catch all routes
app.get('*', (req, res) => {
  console.log(`[server] 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[server] Error:`, err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Error handling
process.on('uncaughtException', (error) => {
  console.error('[server] Uncaught Exception:', error);
  console.log('[server] Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[server] Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('[server] Server will continue running...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[server] SIGTERM received, shutting down gracefully');
  try {
    await pool.end();
  } catch (err) {
    console.error('[server] Error closing DB:', err);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[server] SIGINT received, shutting down gracefully');
  try {
    await pool.end();
  } catch (err) {
    console.error('[server] Error closing DB:', err);
  }
  process.exit(0);
});

const connectWithRetry = async (retries = 3) => {
  console.log(`[server] ✅ Server is running on port ${PORT}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[server] Testing DB connection... (attempt ${i + 1}/${retries})`);
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log(`[server] ✅ DB connection OK`);
      return true;
    } catch (err) {
      console.error(`[server] ❌ DB connection failed (attempt ${i + 1}):`, err.message);
      if (i === retries - 1) {
        console.error("[server] All connection attempts failed. Starting server without DB validation.");
        console.log(`[server] ⚠️ Server running without DB (DB connection not verified)`);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

const server = app.listen(PORT, async () => {
  console.log(`[server] ✅ Server successfully started and listening on port ${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] Server URL: http://localhost:${PORT}`);
  await connectWithRetry();
});

server.on('error', (err) => {
  console.error('[server] ❌ Server error:', err);
});

server.on('listening', () => {
  console.log('[server] ✅ Server is now accepting connections');
});
