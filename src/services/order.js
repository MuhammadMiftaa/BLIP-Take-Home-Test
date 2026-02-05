import {
  NotFoundError,
  InvalidStatusTransitionError,
} from "../utils/errors.js";
import {
  ERROR_MESSAGES,
  ORDER_STATUS_PENDING,
} from "../utils/constant.js";
import logger from "../utils/logger.js";
import { prismaClient } from "../utils/prisma.js";

//$ Create a new order
export async function createOrder(orderData, userId) {
  logger.info("Creating new order", {
    userId,
    product_name: orderData.product_name,
  });

  const order = await prismaClient.order.create({
    data: {
      customer_name: orderData.customer_name,
      product_name: orderData.product_name,
      quantity: orderData.quantity,
    },
  });

  logger.info("Order created successfully", { orderId: order.id, userId });

  return order;
}

//$ Get all orders
export async function getOrders(user) {
  logger.info("Fetching orders", { userId: user.userId, role: user.role });

  const orders = await prismaClient.order.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  logger.info("Orders fetched successfully", {
    count: orders.length,
    userId: user.userId,
  });

  return orders;
}

//$ Get order by ID
export async function getOrderById(orderId) {
  const order = await prismaClient.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    logger.warn("Order not found", { orderId });
    throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
  }

  return order;
}

//$ Update order status
export async function updateOrderStatus(orderId, newStatus, user) {
  logger.info("Updating order status", {
    orderId,
    newStatus,
    userId: user.userId,
    role: user.role,
  });

  // Get the order
  const order = await getOrderById(orderId);

  // Check if status transition is valid for this role
  if (order.status !== ORDER_STATUS_PENDING || newStatus === order.status) {
    logger.warn("Invalid status transition", {
      orderId,
      fromStatus: order.status,
      toStatus: newStatus,
      role: user.role,
    });
    throw new InvalidStatusTransitionError(
      ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
    );
  }

  // Update the order status
  const updatedOrder = await prismaClient.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  logger.info("Order status updated successfully", {
    orderId,
    fromStatus: order.status,
    toStatus: newStatus,
    userId: user.userId,
  });

  return updatedOrder;
}
