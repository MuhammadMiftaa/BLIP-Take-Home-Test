/**
 * Auth Service Tests
 * Tests for authentication service functions
 */
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock modules before importing
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const mockHelper = {
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
};

jest.unstable_mockModule("../../src/utils/prisma.js", () => ({
  prismaClient: mockPrismaClient,
}));

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: mockLogger,
}));

jest.unstable_mockModule("../../src/utils/helper.js", () => mockHelper);

// Import after mocking
const { login } = await import("../../src/services/auth.js");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    const validUser = {
      id: 1,
      email: "admin@example.com",
      password: "$2b$10$hashedpassword",
      role: "ADMIN",
    };

    it("should login successfully with valid credentials and return token", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(validUser);
      mockHelper.comparePassword.mockResolvedValue(true);
      mockHelper.generateToken.mockReturnValue("jwt-token-123");

      const result = await login("admin@example.com", "password123");

      expect(result).toEqual({
        token: "jwt-token-123",
        user: {
          id: 1,
          email: "admin@example.com",
          role: "ADMIN",
        },
      });
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@example.com" },
      });
      expect(mockHelper.comparePassword).toHaveBeenCalledWith(
        "password123",
        validUser.password,
      );
      expect(mockHelper.generateToken).toHaveBeenCalledWith({
        userId: 1,
        email: "admin@example.com",
        role: "ADMIN",
      });
    });

    it("should throw UnauthorizedError when user is not found", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(
        login("nonexistent@example.com", "password123"),
      ).rejects.toThrow("Invalid email or password");
      expect(mockHelper.comparePassword).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when password is incorrect", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(validUser);
      mockHelper.comparePassword.mockResolvedValue(false);

      await expect(login("admin@example.com", "wrongpassword")).rejects.toThrow(
        "Invalid email or password",
      );
      expect(mockHelper.generateToken).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError with empty email", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(login("", "password123")).rejects.toThrow(
        "Invalid email or password",
      );
    });

    it("should throw UnauthorizedError with empty password", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(validUser);
      mockHelper.comparePassword.mockResolvedValue(false);

      await expect(login("admin@example.com", "")).rejects.toThrow(
        "Invalid email or password",
      );
    });

    it("should throw error when database error occurs", async () => {
      mockPrismaClient.user.findUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(login("admin@example.com", "password123")).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
