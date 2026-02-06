const ORDER_STATUS_PENDING = "PENDING";
const ORDER_STATUS_PAID = "PAID";
const ORDER_STATUS_CANCELLED = "CANCELLED";
const ERROR_MESSAGES = {
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  ORDER_NOT_FOUND: "Order not found",
  INVALID_CREDENTIALS: "Invalid credentials",
};

// Define error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

// Business logic functions
const validateStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    throw new ValidationError(`Order is already in ${currentStatus} status`);
  }
  if (currentStatus !== ORDER_STATUS_PENDING) {
    throw new ValidationError(ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
  }
  const validTransitions = [ORDER_STATUS_PAID, ORDER_STATUS_CANCELLED];
  if (!validTransitions.includes(newStatus)) {
    throw new ValidationError(`Invalid status: ${newStatus}`);
  }
  return true;
};

const checkOrderExists = (order) => {
  if (!order) {
    throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
  }
  return order;
};

const validateCredentials = (user, passwordValid) => {
  if (!user || !passwordValid) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }
  return true;
};

const checkPermission = (userRole, requiredRole) => userRole === requiredRole;
const checkMultiplePermissions = (userRole, allowedRoles) =>
  allowedRoles.includes(userRole);

const createOrderData = (input) => ({
  customer_name: input.customer_name,
  product_name: input.product_name,
  quantity: input.quantity,
  status: ORDER_STATUS_PENDING,
});

// Tests
describe("Order Status Transition Logic", function () {
  describe("Valid transitions", function () {
    test("should allow PENDING → PAID", function () {
      expect(validateStatusTransition("PENDING", "PAID")).toBe(true);
    });

    test("should allow PENDING → CANCELLED", function () {
      expect(validateStatusTransition("PENDING", "CANCELLED")).toBe(true);
    });
  });

  describe("Invalid - Same status", function () {
    test("should throw when PENDING → PENDING", function () {
      expect(function () {
        validateStatusTransition("PENDING", "PENDING");
      }).toThrow("Order is already in PENDING status");
    });

    test("should throw when PAID → PAID", function () {
      expect(function () {
        validateStatusTransition("PAID", "PAID");
      }).toThrow("Order is already in PAID status");
    });
  });

  describe("Invalid - Non-PENDING orders", function () {
    test("should throw when PAID → CANCELLED", function () {
      expect(function () {
        validateStatusTransition("PAID", "CANCELLED");
      }).toThrow("Invalid status transition");
    });

    test("should throw when CANCELLED → PAID", function () {
      expect(function () {
        validateStatusTransition("CANCELLED", "PAID");
      }).toThrow("Invalid status transition");
    });
  });
});

describe("Order Not Found Logic", function () {
  test("should return order when found", function () {
    const order = { id: 1, status: "PENDING" };
    expect(checkOrderExists(order)).toEqual(order);
  });

  test("should throw when order is null", function () {
    expect(function () {
      checkOrderExists(null);
    }).toThrow("Order not found");
  });

  test("should throw when order is undefined", function () {
    expect(function () {
      checkOrderExists(undefined);
    }).toThrow(NotFoundError);
  });
});

describe("Login Validation Logic", function () {
  test("should succeed with valid credentials", function () {
    expect(validateCredentials({ id: 1 }, true)).toBe(true);
  });

  test("should fail when user not found", function () {
    expect(function () {
      validateCredentials(null, true);
    }).toThrow("Invalid credentials");
  });

  test("should fail when password invalid", function () {
    expect(function () {
      validateCredentials({ id: 1 }, false);
    }).toThrow("Invalid credentials");
  });
});

describe("Role-Based Access Control", function () {
  describe("Create Order Permission", function () {
    test("should allow ADMIN", function () {
      expect(checkPermission("ADMIN", "ADMIN")).toBe(true);
    });

    test("should deny STAFF", function () {
      expect(checkPermission("STAFF", "ADMIN")).toBe(false);
    });
  });

  describe("View Orders Permission", function () {
    test("should allow ADMIN", function () {
      expect(checkMultiplePermissions("ADMIN", ["ADMIN", "STAFF"])).toBe(true);
    });

    test("should allow STAFF", function () {
      expect(checkMultiplePermissions("STAFF", ["ADMIN", "STAFF"])).toBe(true);
    });
  });
});

describe("Order Creation Logic", function () {
  test("should create with PENDING status", function () {
    const result = createOrderData({
      customer_name: "John",
      product_name: "Laptop",
      quantity: 2,
    });
    expect(result.status).toBe("PENDING");
  });

  test("should ignore input status", function () {
    const result = createOrderData({
      customer_name: "John",
      product_name: "Phone",
      quantity: 1,
      status: "PAID",
    });
    expect(result.status).toBe("PENDING");
  });
});
