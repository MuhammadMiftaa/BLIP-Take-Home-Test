/**
 * Handler Tests
 * Tests for HTTP request handlers
 */
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock modules before importing
const mockAuthService = {
  login: jest.fn(),
};

const mockOrderService = {
  createOrder: jest.fn(),
  getOrders: jest.fn(),
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

jest.unstable_mockModule("../../src/services/auth.js", () => mockAuthService);
jest.unstable_mockModule("../../src/services/order.js", () => mockOrderService);
jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: mockLogger,
}));

// Import after mocking
const authHandler = await import("../../src/handlers/auth.js");
const orderHandler = await import("../../src/handlers/order.js");
const { UnauthorizedError, ValidationError, NotFoundError } =
  await import("../../src/utils/errors.js");

describe("Handlers", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      params: {},
      user: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("Auth Handler", () => {
    describe("login", () => {
      it("should return access_token on successful login", async () => {
        mockReq.body = { email: "admin@example.com", password: "password123" };
        const loginResult = {
          access_token: "jwt-token",
          user: { id: 1, email: "admin@example.com", role: "ADMIN" },
        };
        mockAuthService.login.mockResolvedValue(loginResult);

        await authHandler.login(mockReq, mockRes, mockNext);

        // Handler uses res.json() directly without status
        expect(mockRes.json).toHaveBeenCalledWith(loginResult);
      });

      it("should call next with error on invalid credentials", async () => {
        mockReq.body = { email: "admin@example.com", password: "wrong" };
        const error = new UnauthorizedError("Invalid credentials");
        mockAuthService.login.mockRejectedValue(error);

        await authHandler.login(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("Order Handler", () => {
    describe("createOrder", () => {
      it("should return 201 with created order for ADMIN", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.body = {
          customer_name: "John Doe",
          product_name: "Laptop",
          quantity: 2,
        };
        const createdOrder = {
          id: 1,
          ...mockReq.body,
          status: "PENDING",
        };
        mockOrderService.createOrder.mockResolvedValue(createdOrder);

        await orderHandler.createOrder(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        // Handler returns order directly without wrapper
        expect(mockRes.json).toHaveBeenCalledWith(createdOrder);
      });

      it("should call next with error on service failure", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.body = {
          customer_name: "John",
          product_name: "Laptop",
          quantity: 1,
        };
        const error = new Error("Database error");
        mockOrderService.createOrder.mockRejectedValue(error);

        await orderHandler.createOrder(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe("getOrders", () => {
      it("should return 200 with orders list for ADMIN", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        const orders = [
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
        mockOrderService.getOrders.mockResolvedValue(orders);

        await orderHandler.getOrders(mockReq, mockRes, mockNext);

        // Handler uses res.json() directly without status for GET
        expect(mockRes.json).toHaveBeenCalledWith(orders);
      });

      it("should return 200 with orders list for STAFF", async () => {
        mockReq.user = { userId: 2, role: "STAFF" };
        const orders = [
          {
            id: 1,
            customer_name: "John",
            product_name: "Laptop",
            quantity: 1,
            status: "PENDING",
          },
        ];
        mockOrderService.getOrders.mockResolvedValue(orders);

        await orderHandler.getOrders(mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(orders);
      });

      it("should return empty array when no orders", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockOrderService.getOrders.mockResolvedValue([]);

        await orderHandler.getOrders(mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith([]);
      });
    });

    describe("updateOrderStatus", () => {
      it("should return 200 with updated order when ADMIN updates PENDING to PAID", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.params = { id: "1" };
        mockReq.body = { status: "PAID" };
        const updatedOrder = {
          id: 1,
          customer_name: "John",
          product_name: "Laptop",
          quantity: 1,
          status: "PAID",
        };
        mockOrderService.updateOrderStatus.mockResolvedValue(updatedOrder);

        await orderHandler.updateOrderStatus(mockReq, mockRes, mockNext);

        // Handler uses res.json() directly without status for PATCH
        expect(mockRes.json).toHaveBeenCalledWith(updatedOrder);
      });

      it("should return 200 with updated order when ADMIN updates PENDING to CANCELLED", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.params = { id: "1" };
        mockReq.body = { status: "CANCELLED" };
        const updatedOrder = {
          id: 1,
          customer_name: "John",
          product_name: "Laptop",
          quantity: 1,
          status: "CANCELLED",
        };
        mockOrderService.updateOrderStatus.mockResolvedValue(updatedOrder);

        await orderHandler.updateOrderStatus(mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(updatedOrder);
      });

      it("should call next with NotFoundError when order not found", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.params = { id: "999" };
        mockReq.body = { status: "PAID" };
        const error = new NotFoundError("Order not found");
        mockOrderService.updateOrderStatus.mockRejectedValue(error);

        await orderHandler.updateOrderStatus(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });

      it("should call next with ValidationError when updating to same status", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.params = { id: "1" };
        mockReq.body = { status: "PENDING" };
        const error = new ValidationError("Invalid status transition");
        mockOrderService.updateOrderStatus.mockRejectedValue(error);

        await orderHandler.updateOrderStatus(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });

      it("should call next with ValidationError when invalid status transition", async () => {
        mockReq.user = { userId: 1, role: "ADMIN" };
        mockReq.params = { id: "1" };
        mockReq.body = { status: "CANCELLED" };
        const error = new ValidationError("Invalid status transition");
        mockOrderService.updateOrderStatus.mockRejectedValue(error);

        await orderHandler.updateOrderStatus(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });
});
