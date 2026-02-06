import rateLimit from "express-rate-limit";
import env from "../utils/env.js";
import logger from "../utils/logger.js";

/**
 * Rate limiter middleware configuration
 * Uses in-memory store by default (suitable for single-instance deployments)
 *
 * Configuration via environment variables:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 15 minutes)
 * - RATE_LIMIT_MAX_REQUESTS: Max requests per window per IP (default: 100)
 */
const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    statusCode: 429,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === "/health";
  },
});

export default rateLimiter;
