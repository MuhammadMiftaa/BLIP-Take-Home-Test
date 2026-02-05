import { comparePassword } from "../utils/helper.js";
import { generateToken } from "../utils/helper.js";
import { UnauthorizedError } from "../utils/errors.js";
import { ERROR_MESSAGES } from "../utils/constant.js";
import logger from "../utils/logger.js";
import { prismaClient } from "../utils/prisma.js";

//$ Authenticate user and generate JWT token
export async function login(email, password) {
  logger.info("Login attempt", { email });

  // Find user by email
  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn("Login failed: User not found", { email });
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    logger.warn("Login failed: Invalid password", { email });
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info("Login successful", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    access_token: token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
