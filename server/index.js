import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { securityHeaders, requestLogger, errorHandler } from "./middleware/security.js";
import logger from "./utils/logger.js";
import paymentRoutes from "./routes/payments.js";
import ReversalChecker from "./services/reversalChecker.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize reversal checker
const reversalChecker = new ReversalChecker();

// Middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(apiLimiter);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/payments", paymentRoutes);

// Health check with more details
// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "M-Pesa Payment Gateway",
    timestamp: new Date().toISOString(),
    environment: process.env.MPESA_ENVIRONMENT,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Reversal stats endpoint
app.get("/api/reversal-stats", async (req, res) => {
  try {
    const stats = await reversalChecker.getReversalStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get reversal stats",
    });
  }
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`M-Pesa Payment Server started`, {
    port: PORT,
    environment: process.env.MPESA_ENVIRONMENT || "sandbox",
    corsOrigin: process.env.FRONTEND_URL || "localhost",
  });
  
  // Start reversal checker
  reversalChecker.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  reversalChecker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  reversalChecker.stop();
  process.exit(0);
});