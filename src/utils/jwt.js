import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./errors.js";
import logger from "./logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

//$ Generate JWT token
export function generateToken(payload) {
  logger.debug("Generating JWT token", { userId: payload.userId });
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

//$ Verify and decode JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    logger.debug("JWT token verified successfully", { userId: decoded.userId });
    return decoded;
  } catch (error) {
    logger.warn("JWT verification failed", { error: error.message });
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    throw new UnauthorizedError("Token verification failed");
  }
}
