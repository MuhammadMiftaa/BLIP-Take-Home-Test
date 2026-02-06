import dotenv from "dotenv";

dotenv.config();

const missing = [];

//$ Helper function to get required env
function required(key) {
  const value = process.env[key];
  if (!value) {
    missing.push(`${key} env is not set`);
    return "";
  }
  return value;
}

//$ Helper function to get required env as number
function requiredInt(key) {
  const value = process.env[key];
  if (!value) {
    missing.push(`${key} env is not set`);
    return 0;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    missing.push(`${key} must be number, got "${value}"`);
    return 0;
  }
  return parsed;
}

//$ Load all environment variables
const env = {
  // Server
  PORT: requiredInt("PORT"),
  NODE_ENV: required("NODE_ENV"),

  // Database
  DATABASE_URL: required("DATABASE_URL"),
  DB_MAX_OPEN_CONN: requiredInt("DB_MAX_OPEN_CONN"),
  DB_MIN_IDLE_CONN: requiredInt("DB_MIN_IDLE_CONN"),
  DB_IDLE_TIMEOUT_MS: requiredInt("DB_IDLE_TIMEOUT_MS"),
  DB_CONNECTION_TIMEOUT_MS: requiredInt("DB_CONNECTION_TIMEOUT_MS"),

  // JWT
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: required("JWT_EXPIRES_IN"),

  // Logging
  LOG_LEVEL: required("LOG_LEVEL"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: requiredInt("RATE_LIMIT_WINDOW_MS"),
  RATE_LIMIT_MAX_REQUESTS: requiredInt("RATE_LIMIT_MAX_REQUESTS"),
};

//$ Exit if any env is missing
if (missing.length > 0) {
  console.error("\n❌ Missing environment variables:");
  missing.forEach((m) => console.error(`   - ${m}`));
  console.error("\n");
  process.exit(1);
}

Object.freeze(env);

export default env;
