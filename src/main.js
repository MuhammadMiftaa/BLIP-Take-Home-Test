import "dotenv/config";
import express from "express";
import logger from "./utils/logger.js";
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from "./middlewares/middleware.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Log level: ${process.env.LOG_LEVEL || "info"}`);
});

export default app;
