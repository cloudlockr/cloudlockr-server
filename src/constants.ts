export const __prod__ = process.env.NODE_ENV === "prod";
export const PORT = process.env.PORT || 5000;

export const DB_USERNAME = process.env.DB_USERNAME || "postgres";
export const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
export const DB_NAME = process.env.DB_NAME || "cloudlockr";

export const COOKIE_NAME = process.env.COOKIE_NAME || "sid";
export const SESSION_SECRET = process.env.SESSION_SECRET || "secret sauce";
export const SESSION_LIFETIME = 1000 * 60 * 15; // 15 minutes
export const SESSION_PREFIX = "session";

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
