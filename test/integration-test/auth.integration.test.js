import { jest } from "@jest/globals";

// Set environment variables before importing app
process.env.JWT_SECRET = "test-jwt-secret-key-for-integration-tests";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.DB_MAX_OPEN_CONN = "10";
process.env.DB_MIN_IDLE_CONN = "2";
process.env.DB_IDLE_TIMEOUT_MS = "30000";
process.env.DB_CONNECTION_TIMEOUT_MS = "5000";
process.env.LOG_LEVEL = "error";

// Mock prismaClient before importing app
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.unstable_mockModule("../../src/utils/prisma.js", () => ({
  prismaClient: mockPrismaClient,
}));

// Import after mocking
const request = (await import("supertest")).default;
const { default: app } = await import("../../src/main.js");
const { hashPassword } = await import("../../src/utils/helper.js");

describe("Auth Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const hashedPassword = await hashPassword("admin123");
      const mockUser = {
        id: 1,
        email: "admin@blip.com",
        password: hashedPassword,
        role: "ADMIN",
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "admin@blip.com", password: "admin123" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("admin@blip.com");
      expect(response.body.user.role).toBe("ADMIN");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 401 for invalid email", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "nonexistent@blip.com", password: "password123" });

      expect(response.status).toBe(401);
    });

    it("should return 401 for invalid password", async () => {
      const hashedPassword = await hashPassword("correctpassword");
      const mockUser = {
        id: 1,
        email: "admin@blip.com",
        password: hashedPassword,
        role: "ADMIN",
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "admin@blip.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ password: "password123" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "admin@blip.com" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "invalid-email", password: "password123" });

      expect(response.status).toBe(400);
    });
  });
});
