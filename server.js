// File: backend/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import stylizeRoutes from "./routes/stylize.js";

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(morgan("dev")); // Logging
app.use(
  cors({
    origin: [
      "https://collaborative-whiteboard-client-only.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
); // Enable CORS for all routes
app.use(express.json({ limit: "50mb" })); // Increase payload limit for image data

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Stylization API is running" });
});

// Routes
app.use("/api/stylize", stylizeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Stylization backend server running on port ${PORT}`);
});
