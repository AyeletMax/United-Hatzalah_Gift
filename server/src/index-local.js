import express from "express";
import giftRoutes from "./routes/giftRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/gifts", giftRoutes);

// Mock database for testing
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Server running on port ${PORT} (without DB)`);
  console.log(`[server] Health check: http://localhost:${PORT}/health`);
});