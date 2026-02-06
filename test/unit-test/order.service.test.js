/**
 * Order Service Tests
 * Tests for order service functions
 */
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock modules before importing
const mockPrismaClient = {
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

jest.unstable_mockModule("../../src/utils/prisma.js", () => ({
  prismaClient: mockPrismaClient,
}));

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: mockLogger,
}));

// Import after mocking
const { createOrder, getOrders, getOrderById, updateOrderStatus } =
  await import("../../src/services/order.js");
const { ValidationError, NotFoundError } =
  await import("../../src/utils/errors.js");

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create order successfully", async () => {
      const orderData = {
        customer_name: "John Doe",
        product_name: "Laptop",
        quantity: 2,
      };
      const createdOrder = {
        id: 1,
        ...orderData,
        status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaClient.order.create.mockResolvedValue(createdOrder);

      const result = await createOrder(orderData);

      expect(result).toEqual(createdOrder);
      expect(mockPrismaClient.order.create).toHaveBeenCalledWith({
        data: {
          customer_name: orderData.customer_name,
          product_name: orderData.product_name,
          quantity: orderData.quantity,
          status: "PENDING",
        },
      });
    });

    it("should throw error when database error occurs", async () => {
      mockPrismaClient.order.create.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        createOrder({
          customer_name: "John",
          product_name: "Laptop",
          quantity: 1,
        }),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getOrders", () => {
    it("should return all orders successfully", async () => {
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

      mockPrismaClient.order.findMany.mockResolvedValue(orders);

      const result = await getOrders();

      expect(result).toEqual(orders);
      expect(mockPrismaClient.order.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: "desc" },
      });
    });

    it("should return empty array when no orders exist", async () => {
      mockPrismaClient.order.findMany.mockResolvedValue([]);

      const result = await getOrders();

      expect(result).toEqual([]);
    });
  });

  describe("getOrderById", () => {
    it("should return order when found", async () => {
      const order = {
        id: 1,
        customer_name: "John",
        product_name: "Laptop",
        quantity: 1,
        status: "PENDING",
      };

      mockPrismaClient.order.findUnique.mockResolvedValue(order);

      const result = await getOrderById(1);

      expect(result).toEqual(order);
      expect(mockPrismaClient.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundError when order not found", async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      await expect(getOrderById(999)).rejects.toThrow(NotFoundError);
      await expect(getOrderById(999)).rejects.toThrow("Order not found");
    });
  });

  describe("updateOrderStatus", () => {
    it("should update PENDING order to PAID successfully", async () => {
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

      const result = await updateOrderStatus(1, "PAID");

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaClient.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: "PAID" },
      });
    });

    it("should update PENDING order to CANCELLED successfully", async () => {
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

      const result = await updateOrderStatus(1, "CANCELLED");

      expect(result).toEqual(updatedOrder);
    });

    it("should throw NotFoundError when order does not exist", async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      await expect(updateOrderStatus(999, "PAID")).rejects.toThrow(
        NotFoundError,
      );
      await expect(updateOrderStatus(999, "PAID")).rejects.toThrow(
        "Order not found",
      );
    });

    it("should throw ValidationError when updating to same status (PENDING → PENDING)", async () => {
      const existingOrder = {
        id: 1,
        status: "PENDING",
      };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);

      await expect(updateOrderStatus(1, "PENDING")).rejects.toThrow(
        ValidationError,
      );
      await expect(updateOrderStatus(1, "PENDING")).rejects.toThrow(
        "Order is already in PENDING status",
      );
    });

    it("should throw ValidationError when updating PAID order", async () => {
      const existingOrder = {
        id: 1,
        status: "PAID",
      };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);

      await expect(updateOrderStatus(1, "CANCELLED")).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError when updating CANCELLED order", async () => {
      const existingOrder = {
        id: 1,
        status: "CANCELLED",
      };

      mockPrismaClient.order.findUnique.mockResolvedValue(existingOrder);

      await expect(updateOrderStatus(1, "PAID")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
