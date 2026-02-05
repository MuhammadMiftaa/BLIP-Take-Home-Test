import { Router } from "express";
import * as orderHandler from "../handlers/order.js";
import { authenticate, validate } from "../middlewares/middleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from "../validation/order.js";

const router = Router();

//$ All order routes require authentication
router.use(authenticate);

//$ Order routes
router.post("/", validate(createOrderSchema), orderHandler.createOrder);
router.get("/", orderHandler.getOrders);
router.patch(
  "/:id/status",
  validate(orderIdParamSchema, "params"),
  validate(updateOrderStatusSchema),
  orderHandler.updateOrderStatus,
);

export default router;
