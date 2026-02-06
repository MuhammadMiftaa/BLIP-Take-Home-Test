// Import env first to validate all environment variables at startup
import env from "./utils/env.js";
import express from "express";
import logger from "./utils/logger.js";
import rateLimiter from "./middlewares/rateLimiter.js";
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from "./middlewares/middleware.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
app.use(rateLimiter);

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
app.listen(env.PORT, () => {
  logger.info(`Server started on port ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Log level: ${env.LOG_LEVEL}`);
});

export default app;
