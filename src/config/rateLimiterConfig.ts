// import { RateLimiterRedis } from "rate-limiter-flexible";
// import {
//   LOGIN_POINTS,
//   LOGIN_PREFIX,
//   RATE_DAY_BLOCK,
//   RATE_DAY_POINTS,
//   RATE_DAY_PREFIX,
//   RATE_HOUR_BLOCK,
//   RATE_HOUR_POINTS,
//   RATE_HOUR_PREFIX,
//   RATE_SEC_BLOCK,
//   RATE_SEC_POINTS,
//   RATE_SEC_PREFIX,
// } from "../constants";
// import { redis } from "./redisConfig";

// // general rate limiting per ip address
// const secondRateLimiter = new RateLimiterRedis({
//   storeClient: redis,
//   points: RATE_SEC_POINTS,
//   duration: 1,
//   blockDuration: RATE_SEC_BLOCK,
//   keyPrefix: RATE_SEC_PREFIX,
// });

// const hourRateLimiter = new RateLimiterRedis({
//   storeClient: redis,
//   points: RATE_HOUR_POINTS,
//   duration: 60 * 60,
//   blockDuration: RATE_HOUR_BLOCK,
//   keyPrefix: RATE_HOUR_PREFIX,
// });

// const dayRateLimiter = new RateLimiterRedis({
//   storeClient: redis,
//   points: RATE_DAY_POINTS,
//   duration: 60 * 60 * 24,
//   blockDuration: RATE_DAY_BLOCK,
//   keyPrefix: RATE_DAY_PREFIX,
// });

// // TODO: rate limiting for login, register, and forget password
// const loginLimiter = new RateLimiterRedis({
//   storeClient: redis,
//   points: LOGIN_POINTS,
//   duration: 60 * 60 * 24 * 30,
//   keyPrefix: LOGIN_PREFIX,
// });

// export { secondRateLimiter, hourRateLimiter, dayRateLimiter, loginLimiter };
