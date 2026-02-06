import {
  USER_ROLE_ADMIN,
  USER_ROLE_STAFF,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_PAID,
  ORDER_STATUS_CANCELLED,
  SALT_ROUNDS,
  ERROR_MESSAGES,
} from "../../src/utils/constant.js";

describe("Constants", () => {
  describe("User Roles", () => {
    it("should have ADMIN role defined", () => {
      expect(USER_ROLE_ADMIN).toBe("ADMIN");
    });

    it("should have STAFF role defined", () => {
      expect(USER_ROLE_STAFF).toBe("STAFF");
    });
  });

  describe("Order Statuses", () => {
    it("should have PENDING status defined", () => {
      expect(ORDER_STATUS_PENDING).toBe("PENDING");
    });

    it("should have PAID status defined", () => {
      expect(ORDER_STATUS_PAID).toBe("PAID");
    });

    it("should have CANCELLED status defined", () => {
      expect(ORDER_STATUS_CANCELLED).toBe("CANCELLED");
    });
  });

  describe("SALT_ROUNDS", () => {
    it("should be 10", () => {
      expect(SALT_ROUNDS).toBe(10);
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("should have INVALID_CREDENTIALS message", () => {
      expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toBe("Invalid credentials");
    });

    it("should have TOKEN_REQUIRED message", () => {
      expect(ERROR_MESSAGES.TOKEN_REQUIRED).toBe(
        "Authentication token is required",
      );
    });

    it("should have FORBIDDEN message", () => {
      expect(ERROR_MESSAGES.FORBIDDEN).toBeDefined();
    });

    it("should have ORDER_NOT_FOUND message", () => {
      expect(ERROR_MESSAGES.ORDER_NOT_FOUND).toBe("Order not found");
    });

    it("should have INVALID_STATUS_TRANSITION message", () => {
      expect(ERROR_MESSAGES.INVALID_STATUS_TRANSITION).toBe(
        "Invalid status transition",
      );
    });

    it("should have INTERNAL_SERVER_ERROR message", () => {
      expect(ERROR_MESSAGES.INTERNAL_SERVER_ERROR).toBe(
        "Internal server error",
      );
    });
  });
});
