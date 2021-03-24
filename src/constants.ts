export const __prod__ = process.env.NODE_ENV === "prod";
export const PORT = process.env.PORT || 5000;

export const DB_URL = process.env.DB_URL;
export const DB_TEST_URL = process.env.DB_TEST_URL;
export const REDIS_URL = process.env.REDIS_URL;

// constants for JWT
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "access secret";
export const TOKEN_LIFETIME = 60 * 15; // 15 minutes
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh secret";
export const REFRESH_LIFETIME = 60 * 60 * 24; // 1 day
export const REFRESH_PREFIX = "refresh-token";
