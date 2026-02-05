import { compare, hash } from "bcrypt";
import { SALT_ROUNDS } from "./constant.js";

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
export async function comparePassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}
