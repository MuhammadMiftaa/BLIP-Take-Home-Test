// Setup file for tests
// Set environment variables before any imports
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";
process.env.PORT = "3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.DB_MAX_OPEN_CONN = "10";
process.env.DB_MIN_IDLE_CONN = "2";
process.env.DB_IDLE_TIMEOUT_MS = "30000";
process.env.DB_CONNECTION_TIMEOUT_MS = "5000";
process.env.LOG_LEVEL = "error";

// Export mock factories for use in tests
export const createMockPrismaClient = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $disconnect: jest.fn(),
});

export const createMockLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

export const createMockHelper = () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
});
