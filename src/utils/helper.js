import { compare, hash } from "bcrypt";
import { SALT_ROUNDS } from "./constant.js";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./errors.js";
import logger from "./logger.js";
import env from "./env.js";

//$ Hash a plain text password
export async function hashPassword(password) {
  return await hash(password, SALT_ROUNDS);
}

//$ Compare plain text password with hashed password
 export async function comparePassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

//$ Generate JWT token
export function generateToken(payload) {
  logger.debug("Generating JWT token", { userId: payload.userId });
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

//$ Verify and decode JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
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
