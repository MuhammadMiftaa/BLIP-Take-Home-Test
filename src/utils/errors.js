//$ Base class for custom application errors
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

//$ 400 Bad Request - Validation errors
export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

//$ 401 Unauthorized - Authentication required or failed
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

//$ 403 Forbidden - User doesn't have permission
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

//$ 404 Not Found - Resource not found
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

//$ 409 Conflict - Resource conflict (e.g., duplicate entry)
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

//$ 422 Unprocessable Entity - Invalid status transition
export class InvalidStatusTransitionError extends AppError {
  constructor(message = "Invalid status transition") {
    super(message, 422);
  }
}
