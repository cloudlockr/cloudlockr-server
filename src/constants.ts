export const __prod__ = process.env.NODE_ENV === "prod";
export const PORT = process.env.PORT || 5000;

export const DB_USERNAME = process.env.DB_USERNAME || "postgres";
export const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
export const DB_NAME = process.env.DB_NAME || "cloudlockr";

export const COOKIE_NAME = process.env.COOKIE_NAME || "sid";
export const SESSION_SECRET = process.env.SESSION_SECRET || "secret sauce";
export const SESSION_LIFETIME = 1000 * 60 * 15; // 15 minutes

export const JWT_SECRET = process.env.JWT_SECRET || "secret sauce1";
export const JWT_LIFETIME = 60 * 15; // 15 minutes
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "secret sauce2";
