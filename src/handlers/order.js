import * as orderService from "../services/order.js";
import logger from "../utils/logger.js";

//$ Handle create order request
export async function createOrder(req, res, next) {
  try {
    const { customer_name, product_name, quantity } = req.body;
    const userId = req.user.userId;

    logger.debug("Processing create order request", { userId, product_name });

    const order = await orderService.createOrder(
      { customer_name, product_name, quantity },
      userId,
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

//$ Handle get orders request
export async function getOrders(req, res, next) {
  try {
    logger.debug("Processing get orders request", {
      userId: req.user.userId,
      role: req.user.role,
    });

    const orders = await orderService.getOrders(req.user);

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

//$ Handle update order status request
export async function updateOrderStatus(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    logger.debug("Processing update order status request", {
      orderId,
      newStatus: status,
      userId: req.user.userId,
    });

    const order = await orderService.updateOrderStatus(
      orderId,
      status,
      req.user,
    );

    res.json(order);
  } catch (error) {
    next(error);
  }
}
