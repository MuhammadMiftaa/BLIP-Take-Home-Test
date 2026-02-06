import { loginSchema } from "../../src/validation/auth.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from "../../src/validation/order.js";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    // Test 1: Valid login data
    it("should pass with valid email and password", () => {
      const data = { email: "admin@blip.com", password: "admin123" };
      const { error } = loginSchema.validate(data);
      expect(error).toBeUndefined();
    });

    // Test 2: Missing email
    it("should fail when email is missing", () => {
      const data = { password: "admin123" };
      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("email");
    });

    // Test 3: Missing password
    it("should fail when password is missing", () => {
      const data = { email: "admin@blip.com" };
      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("password");
    });

    // Test 4: Invalid email format
    it("should fail with invalid email format", () => {
      const data = { email: "invalid-email", password: "admin123" };
      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("email");
    });

    // Test 5: Empty email
    it("should fail with empty email", () => {
      const data = { email: "", password: "admin123" };
      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 6: Empty password
    it("should fail with empty password", () => {
      const data = { email: "admin@blip.com", password: "" };
      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe("createOrderSchema", () => {
    // Test 7: Valid order data
    it("should pass with valid order data", () => {
      const data = {
        customer_name: "John Doe",
        product_name: "Laptop",
        quantity: 2,
      };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeUndefined();
    });

    // Test 8: Missing customer_name
    it("should fail when customer_name is missing", () => {
      const data = { product_name: "Laptop", quantity: 2 };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("customer_name");
    });

    // Test 9: Missing product_name
    it("should fail when product_name is missing", () => {
      const data = { customer_name: "John Doe", quantity: 2 };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("product_name");
    });

    // Test 10: Missing quantity
    it("should fail when quantity is missing", () => {
      const data = { customer_name: "John Doe", product_name: "Laptop" };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("quantity");
    });

    // Test 11: Quantity less than 1
    it("should fail when quantity is less than 1", () => {
      const data = {
        customer_name: "John Doe",
        product_name: "Laptop",
        quantity: 0,
      };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("at least 1");
    });

    // Test 12: Quantity is negative
    it("should fail when quantity is negative", () => {
      const data = {
        customer_name: "John Doe",
        product_name: "Laptop",
        quantity: -5,
      };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 13: Quantity is not integer
    it("should fail when quantity is not an integer", () => {
      const data = {
        customer_name: "John Doe",
        product_name: "Laptop",
        quantity: 2.5,
      };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("integer");
    });

    // Test 14: Empty customer_name
    it("should fail with empty customer_name", () => {
      const data = {
        customer_name: "",
        product_name: "Laptop",
        quantity: 2,
      };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 15: Empty product_name
    it("should fail with empty product_name", () => {
      const data = {
        customer_name: "John Doe",
        product_name: "",
        quantity: 2,
      };
      const { error } = createOrderSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe("updateOrderStatusSchema", () => {
    // Test 16: Valid status - PAID
    it("should pass with PAID status", () => {
      const data = { status: "PAID" };
      const { error } = updateOrderStatusSchema.validate(data);
      expect(error).toBeUndefined();
    });

    // Test 17: Valid status - CANCELLED
    it("should pass with CANCELLED status", () => {
      const data = { status: "CANCELLED" };
      const { error } = updateOrderStatusSchema.validate(data);
      expect(error).toBeUndefined();
    });

    // Test 18: Valid status - PENDING
    it("should pass with PENDING status", () => {
      const data = { status: "PENDING" };
      const { error } = updateOrderStatusSchema.validate(data);
      expect(error).toBeUndefined();
    });

    // Test 19: Invalid status value
    it("should fail with invalid status value", () => {
      const data = { status: "INVALID" };
      const { error } = updateOrderStatusSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("must be one of");
    });

    // Test 20: Missing status
    it("should fail when status is missing", () => {
      const data = {};
      const { error } = updateOrderStatusSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 21: Empty status
    it("should fail with empty status", () => {
      const data = { status: "" };
      const { error } = updateOrderStatusSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe("orderIdParamSchema", () => {
    // Test 22: Valid order ID
    it("should pass with valid integer ID", () => {
      const data = { id: 1 };
      const { error } = orderIdParamSchema.validate(data);
      expect(error).toBeUndefined();
    });

    // Test 23: Invalid ID - not a number
    it("should fail when ID is not a number", () => {
      const data = { id: "abc" };
      const { error } = orderIdParamSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 24: Invalid ID - negative number
    it("should fail when ID is negative", () => {
      const data = { id: -1 };
      const { error } = orderIdParamSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 25: Invalid ID - zero
    it("should fail when ID is zero", () => {
      const data = { id: 0 };
      const { error } = orderIdParamSchema.validate(data);
      expect(error).toBeDefined();
    });

    // Test 26: Missing ID
    it("should fail when ID is missing", () => {
      const data = {};
      const { error } = orderIdParamSchema.validate(data);
      expect(error).toBeDefined();
    });
  });
});
