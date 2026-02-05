import { verifyToken } from "../utils/helper.js";
import {
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";
import { ERROR_MESSAGES } from "../utils/constant.js";
import logger from "../utils/logger.js";

//$ Extracts user info from token and attaches to req.user
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Authentication failed: No authorization header");
      throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      logger.warn("Authentication failed: Invalid authorization header format");
      throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_INVALID);
    }

    const token = parts[1];
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug("User authenticated successfully", {
      userId: req.user.userId,
      role: req.user.role,
    });
    next();
  } catch (error) {
    next(error);
  }
}

//$ Checks if user has required role(s)
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("Authorization failed: No user in request");
        throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_REQUIRED);
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn("Authorization failed: Insufficient permissions", {
          userId: req.user.userId,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
        });
        throw new ForbiddenError(ERROR_MESSAGES.FORBIDDEN);
      }

      logger.debug("User authorized", {
        userId: req.user.userId,
        role: req.user.role,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

//$ Validates request body against Joi schema
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", ");
      logger.warn("Validation failed", { source, errors: errorMessages });
      return next(new ValidationError(errorMessages));
    }

    // Replace original data with validated/sanitized data
    req[source] = value;
    next();
  };
}

//$ Handles all errors and sends appropriate response
export function errorHandler(err, req, res, next) {
  // Log the error
  if (err.isOperational) {
    logger.warn("Operational error", {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error("Unexpected error", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.isOperational
      ? err.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
}

//$ 404 Not Found handler
export function notFoundHandler(req, res, next) {
  logger.warn("Route not found", { path: req.path, method: req.method });
  res.status(404).json({
    error: "Route not found",
  });
}

//$ Request logging middleware
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 500) {
      logger.error("Request completed with server error", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Request completed with client error", logData);
    } else {
      logger.http("Request completed", logData);
    }
  });

  next();
}
