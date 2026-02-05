import Joi from "joi";
import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_PAID,
  ORDER_STATUS_CANCELLED,
} from "../utils/constant.js";


//$ Validation schema for creating a new order
export const createOrderSchema = Joi.object({
  customer_name: Joi.string().required().min(1).max(255).messages({
    "string.empty": "Customer name is required",
    "string.min": "Customer name must be at least 1 character",
    "string.max": "Customer name must not exceed 255 characters",
    "any.required": "Customer name is required",
  }),
  product_name: Joi.string().required().min(1).max(255).messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 1 character",
    "string.max": "Product name must not exceed 255 characters",
    "any.required": "Product name is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

//$ Validation schema for updating order status
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(ORDER_STATUS_PENDING, ORDER_STATUS_PAID, ORDER_STATUS_CANCELLED)
    .required()
    .messages({
      "any.only": `Status must be one of: ${ORDER_STATUS_PENDING}, ${ORDER_STATUS_PAID}, ${ORDER_STATUS_CANCELLED}`,
      "any.required": "Status is required",
    }),
});

//$ Validation schema for order ID parameter
export const orderIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Order ID must be a number",
    "number.integer": "Order ID must be an integer",
    "number.positive": "Order ID must be a positive number",
    "any.required": "Order ID is required",
  }),
});
