import { Router } from "express";
import * as orderHandler from "../handlers/order.js";
import {
  authenticate,
  authorize,
  validate,
} from "../middlewares/middleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from "../validation/order.js";

const router = Router();

//$ All order routes require authentication
router.use(authenticate);

//$ Order routes
router.post(
  "/",
  authorize("ADMIN"),
  validate(createOrderSchema),
  orderHandler.createOrder,
);
router.get("/", orderHandler.getOrders);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(orderIdParamSchema, "params"),
  validate(updateOrderStatusSchema),
  orderHandler.updateOrderStatus,
);

export default router;
