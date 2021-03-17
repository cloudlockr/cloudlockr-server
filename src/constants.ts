export const __prod__ = process.env.NODE_ENV === "prod";
export const PORT = process.env.PORT || 5000;

export const DB_URL = process.env.DB_URL;
export const REDIS_URL = process.env.REDIS_URL;

// constants for JWT
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "access secret";
export const TOKEN_LIFETIME = 60 * 15; // 15 minutes
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh secret";
export const REFRESH_LIFETIME = 60 * 60 * 24; // 1 day
export const REFRESH_PREFIX = "refresh-token";

// quite arbitary request rate limits
export const RATE_SEC_POINTS = 10;
export const RATE_SEC_BLOCK = 10;
export const RATE_SEC_PREFIX = "sec";

export const RATE_HOUR_POINTS = 5000;
export const RATE_HOUR_BLOCK = 60 * 15;
export const RATE_HOUR_PREFIX = "hour";

export const RATE_DAY_POINTS = 30000;
export const RATE_DAY_BLOCK = 60 * 60 * 2;
export const RATE_DAY_PREFIX = "day";

// login rate limits
export const LOGIN_POINTS = 5;
// export const LOGIN_BLOCK = 60 * 15;
export const LOGIN_BLOCK = 15;
export const LOGIN_NAME = "loginBlock";
export const LOGIN_PREFIX = "login";
