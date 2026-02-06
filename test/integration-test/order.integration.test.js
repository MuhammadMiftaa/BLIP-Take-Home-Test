import { jest } from "@jest/globals";

// Set environment variables before importing app
process.env.JWT_SECRET = "test-jwt-secret-key-for-integration-tests";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";
process.env.PORT = "3002";
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
const { generateToken } = await import("../../src/utils/helper.js");

// Helper to generate test tokens
const getAdminToken = () =>
  generateToken({ userId: 1, email: "admin@blip.com", role: "ADMIN" });
const getStaffToken = () =>
  generateToken({ userId: 2, email: "staff@blip.com", role: "STAFF" });

describe("Order Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /orders", () => {
    const validOrderData = {
      customer_name: "John Doe",
      product_name: "Laptop",
      quantity: 2,
    };

    it("should create order successfully as ADMIN", async () => {
      const mockOrder = {
        id: 1,
        ...validOrderData,
        status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaClient.order.create.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body.customer_name).toBe("John Doe");
      expect(response.body.product_name).toBe("Laptop");
      expect(response.body.quantity).toBe(2);
      expect(response.body.status).toBe("PENDING");
    });

    it("should return 403 when STAFF tries to create order", async () => {
      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${getStaffToken()}`)
        .send(validOrderData);

      expect(response.status).toBe(403);
    });

    it("should return 401 when no token provided", async () => {
      const response = await request(app).post("/orders").send(validOrderData);

      expect(response.status).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ customer_name: "John" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid quantity", async () => {
      const response = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ ...validOrderData, quantity: 0 });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /orders", () => {
    it("should get all orders as ADMIN", async () => {
      const mockOrders = [
        {
          id: 1,
          customer_name: "John",
          product_name: "Laptop",
          quantity: 1,
          status: "PENDING",
        },
        {
          id: 2,
          customer_name: "Jane",
          product_name: "Phone",
          quantity: 2,
          status: "PAID",
        },
      ];

      mockPrismaClient.order.findMany.mockResolvedValue(mockOrders);

      const response = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${getAdminToken()}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it("should get all orders as STAFF", async () => {
      const mockOrders = [
        {
          id: 1,
          customer_name: "John",
          product_name: "Laptop",
          quantity: 1,
          status: "PENDING",
        },
      ];

      mockPrismaClient.order.findMany.mockResolvedValue(mockOrders);

      const response = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${getStaffToken()}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 when no token provided", async () => {
      const response = await request(app).get("/orders");

      expect(response.status).toBe(401);
    });

    it("should return empty array when no orders exist", async () => {
      mockPrismaClient.order.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${getAdminToken()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("PATCH /orders/:id/status", () => {
    it("should update order status PENDING to PAID as ADMIN", async () => {
      const existingOrder = {
        id: 1,
        customer_name: "John",
        product_name: "Laptop",
        quantity: 1,
        status: "PENDING",
      };
      const updatedOrder = { ...existingOrder, status: "PAID" };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaClient.order.update.mockResolvedValue(updatedOrder);

      const response = await request(app)
        .patch("/orders/1/status")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ status: "PAID" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("PAID");
    });

    it("should update order status PENDING to CANCELLED as ADMIN", async () => {
      const existingOrder = {
        id: 1,
        customer_name: "John",
        product_name: "Laptop",
        quantity: 1,
        status: "PENDING",
      };
      const updatedOrder = { ...existingOrder, status: "CANCELLED" };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaClient.order.update.mockResolvedValue(updatedOrder);

      const response = await request(app)
        .patch("/orders/1/status")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ status: "CANCELLED" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("CANCELLED");
    });

    it("should return 403 when STAFF tries to update order status", async () => {
      const response = await request(app)
        .patch("/orders/1/status")
        .set("Authorization", `Bearer ${getStaffToken()}`)
        .send({ status: "PAID" });

      expect(response.status).toBe(403);
    });

    it("should return 401 when no token provided", async () => {
      const response = await request(app)
        .patch("/orders/1/status")
        .send({ status: "PAID" });

      expect(response.status).toBe(401);
    });

    it("should return 404 when order not found", async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch("/orders/999/status")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ status: "PAID" });

      expect(response.status).toBe(404);
    });

    it("should return 400 for invalid status transition PAID to CANCELLED", async () => {
      const existingOrder = {
        id: 1,
        customer_name: "John",
        product_name: "Laptop",
        quantity: 1,
        status: "PAID",
      };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);

      const response = await request(app)
        .patch("/orders/1/status")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ status: "CANCELLED" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for same status transition PENDING to PENDING", async () => {
      const existingOrder = {
        id: 1,
        customer_name: "John",
        product_name: "Laptop",
        quantity: 1,
        status: "PENDING",
      };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);

      const response = await request(app)
        .patch("/orders/1/status")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ status: "PENDING" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid status value", async () => {
      const response = await request(app)
        .patch("/orders/1/status")
        .set("Authorization", `Bearer ${getAdminToken()}`)
        .send({ status: "INVALID" });

      expect(response.status).toBe(400);
    });
  });
});
