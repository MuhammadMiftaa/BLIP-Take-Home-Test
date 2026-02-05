// User Roles
export const USER_ROLE_ADMIN = "ADMIN";
export const USER_ROLE_STAFF = "STAFF";

// Order Status
export const ORDER_STATUS_PENDING = "PENDING";
export const ORDER_STATUS_PAID = "PAID";
export const ORDER_STATUS_CANCELLED = "CANCELLED";

// Password Hashing
export const SALT_ROUNDS = 10;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Invalid email or password",
  TOKEN_REQUIRED: "Authentication token is required",
  TOKEN_INVALID: "Invalid or expired token",

  // Authorization
  FORBIDDEN: "You do not have permission to perform this action",
  ADMIN_ONLY: "This action is restricted to administrators only",

  // Orders
  ORDER_NOT_FOUND: "Order not found",
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  CANNOT_UPDATE_OWN_ORDER_ONLY: "You can only update your own orders",

  // Validation
  VALIDATION_FAILED: "Validation failed",

  // Server
  INTERNAL_SERVER_ERROR: "Internal server error",
};

// Valid status transitions
// Format: { fromStatus: { role: [allowedToStatuses] } }
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS_PENDING]: {
    [USER_ROLE_ADMIN]: [ORDER_STATUS_PAID, ORDER_STATUS_CANCELLED],
    [USER_ROLE_STAFF]: [ORDER_STATUS_CANCELLED], // Only for their own orders
  },
  [ORDER_STATUS_PAID]: {
    [USER_ROLE_ADMIN]: [ORDER_STATUS_CANCELLED],
    [USER_ROLE_STAFF]: [], // Staff cannot change PAID orders
  },
  [ORDER_STATUS_CANCELLED]: {
    [USER_ROLE_ADMIN]: [],
    [USER_ROLE_STAFF]: [],
  },
};
