class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal server error",
};

describe("Middleware Logic Tests", () => {
  describe("Authorization Logic", () => {
    const checkAuthorization = (userRole, allowedRoles) => {
      return allowedRoles.includes(userRole);
    };

    it("should allow ADMIN user to access ADMIN-only route", () => {
      const result = checkAuthorization("ADMIN", ["ADMIN"]);
      expect(result).toBe(true);
    });

    it("should deny STAFF user from accessing ADMIN-only route", () => {
      const result = checkAuthorization("STAFF", ["ADMIN"]);
      expect(result).toBe(false);
    });

    it("should allow STAFF user when STAFF is in allowed roles", () => {
      const result = checkAuthorization("STAFF", ["ADMIN", "STAFF"]);
      expect(result).toBe(true);
    });

    it("should allow ADMIN user when multiple roles are allowed", () => {
      const result = checkAuthorization("ADMIN", ["ADMIN", "STAFF"]);
      expect(result).toBe(true);
    });
  });

  describe("Error Handler Response Mapping", () => {
    const mapErrorToResponse = (error) => {
      const statusCode = error.statusCode || 500;
      const message = error.isOperational
        ? error.message
        : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
      return { statusCode, message };
    };

    it("should map ValidationError to 400 response", () => {
      const error = new ValidationError("Invalid input");
      const response = mapErrorToResponse(error);

      expect(response.statusCode).toBe(400);
      expect(response.message).toBe("Invalid input");
    });

    it("should map UnauthorizedError to 401 response", () => {
      const error = new UnauthorizedError("Invalid token");
      const response = mapErrorToResponse(error);

      expect(response.statusCode).toBe(401);
      expect(response.message).toBe("Invalid token");
    });

    it("should map ForbiddenError to 403 response", () => {
      const error = new ForbiddenError("Access denied");
      const response = mapErrorToResponse(error);

      expect(response.statusCode).toBe(403);
      expect(response.message).toBe("Access denied");
    });

    it("should map NotFoundError to 404 response", () => {
      const error = new NotFoundError("Resource not found");
      const response = mapErrorToResponse(error);

      expect(response.statusCode).toBe(404);
      expect(response.message).toBe("Resource not found");
    });

    it("should map generic Error to 500 with internal message", () => {
      const error = new Error("Something went wrong");
      const response = mapErrorToResponse(error);

      expect(response.statusCode).toBe(500);
      expect(response.message).toBe("Internal server error");
    });

    it("should map AppError with custom status code", () => {
      const error = new AppError("Custom error", 422);
      const response = mapErrorToResponse(error);

      expect(response.statusCode).toBe(422);
      expect(response.message).toBe("Custom error");
    });
  });

  describe("Token Extraction Logic", () => {
    const extractToken = (authHeader) => {
      if (!authHeader) {
        return { error: "No authorization header" };
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return { error: "Invalid authorization header format" };
      }

      return { token: parts[1] };
    };

    it("should extract token from valid Bearer header", () => {
      const result = extractToken("Bearer abc123token");
      expect(result.token).toBe("abc123token");
      expect(result.error).toBeUndefined();
    });

    it("should return error when no header provided", () => {
      const result = extractToken(undefined);
      expect(result.error).toBe("No authorization header");
    });

    it("should return error when header format is invalid", () => {
      const result = extractToken("InvalidFormat token");
      expect(result.error).toBe("Invalid authorization header format");
    });

    it("should return error when only token without Bearer prefix", () => {
      const result = extractToken("abc123token");
      expect(result.error).toBe("Invalid authorization header format");
    });

    it("should return error when Basic auth is used instead of Bearer", () => {
      const result = extractToken("Basic abc123");
      expect(result.error).toBe("Invalid authorization header format");
    });
  });

  describe("Validate Function Logic", () => {
    // Simulating Joi-like validation
    const createValidator = (rules) => {
      return (data) => {
        const errors = [];
        for (const [field, rule] of Object.entries(rules)) {
          if (
            rule.required &&
            (data[field] === undefined || data[field] === "")
          ) {
            errors.push(`"${field}" is required`);
          }
          if (rule.min !== undefined && data[field] < rule.min) {
            errors.push(`"${field}" must be at least ${rule.min}`);
          }
          if (rule.email && data[field] && !data[field].includes("@")) {
            errors.push(`"${field}" must be a valid email`);
          }
        }
        return errors.length > 0
          ? { error: errors.join(", ") }
          : { value: data };
      };
    };

    describe("Login validation", () => {
      const validateLogin = createValidator({
        email: { required: true, email: true },
        password: { required: true },
      });

      it("should pass with valid login data", () => {
        const result = validateLogin({
          email: "test@example.com",
          password: "pass123",
        });
        expect(result.error).toBeUndefined();
        expect(result.value).toEqual({
          email: "test@example.com",
          password: "pass123",
        });
      });

      it("should fail without email", () => {
        const result = validateLogin({ password: "pass123" });
        expect(result.error).toContain('"email" is required');
      });

      it("should fail without password", () => {
        const result = validateLogin({ email: "test@example.com" });
        expect(result.error).toContain('"password" is required');
      });

      it("should fail with invalid email format", () => {
        const result = validateLogin({ email: "invalid", password: "pass123" });
        expect(result.error).toContain("valid email");
      });
    });

    describe("Create order validation", () => {
      const validateOrder = createValidator({
        customer_name: { required: true },
        product_name: { required: true },
        quantity: { required: true, min: 1 },
      });

      it("should pass with valid order data", () => {
        const result = validateOrder({
          customer_name: "John",
          product_name: "Laptop",
          quantity: 2,
        });
        expect(result.error).toBeUndefined();
      });

      it("should fail without customer_name", () => {
        const result = validateOrder({ product_name: "Laptop", quantity: 2 });
        expect(result.error).toContain('"customer_name" is required');
      });

      it("should fail with quantity less than 1", () => {
        const result = validateOrder({
          customer_name: "John",
          product_name: "Laptop",
          quantity: 0,
        });
        expect(result.error).toContain("at least 1");
      });
    });

    describe("Update order status validation", () => {
      const validStatuses = ["PENDING", "PAID", "CANCELLED"];
      const validateStatus = (data) => {
        if (!data.status) {
          return { error: '"status" is required' };
        }
        if (!validStatuses.includes(data.status)) {
          return {
            error: `"status" must be one of ${validStatuses.join(", ")}`,
          };
        }
        return { value: data };
      };

      it("should pass with PAID status", () => {
        const result = validateStatus({ status: "PAID" });
        expect(result.error).toBeUndefined();
        expect(result.value.status).toBe("PAID");
      });

      it("should pass with CANCELLED status", () => {
        const result = validateStatus({ status: "CANCELLED" });
        expect(result.error).toBeUndefined();
      });

      it("should fail with invalid status", () => {
        const result = validateStatus({ status: "INVALID" });
        expect(result.error).toBeDefined();
      });

      it("should fail when status is missing", () => {
        const result = validateStatus({});
        expect(result.error).toContain("required");
      });
    });
  });
});
