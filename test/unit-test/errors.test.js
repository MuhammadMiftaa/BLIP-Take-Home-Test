import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../../src/utils/errors.js";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create an error with message and statusCode", () => {
      const error = new AppError("Something went wrong", 500);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Something went wrong");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("AppError");
    });

    it("should default to 500 status code", () => {
      const error = new AppError("Error message");

      expect(error.statusCode).toBe(500);
    });
  });

  describe("ValidationError", () => {
    it("should create error with 400 status code", () => {
      const error = new ValidationError("Invalid input");

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("UnauthorizedError", () => {
    it("should create error with 401 status code", () => {
      const error = new UnauthorizedError("Invalid credentials");

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe("Invalid credentials");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should have default message", () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe("Unauthorized");
    });
  });

  describe("ForbiddenError", () => {
    it("should create error with 403 status code", () => {
      const error = new ForbiddenError("Access denied");

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toBe("Access denied");
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe("ForbiddenError");
    });

    it("should have default message", () => {
      const error = new ForbiddenError();

      expect(error.message).toBe("Forbidden");
    });
  });

  describe("NotFoundError", () => {
    it("should create error with 404 status code", () => {
      const error = new NotFoundError("Resource not found");

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("NotFoundError");
    });

    it("should have default message", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Not found");
    });
  });
});
