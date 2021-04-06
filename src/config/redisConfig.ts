/**
 * This module specifies the Redis connection
 *
 * Redis is used to store the refresh token whitelist.
 */

import Redis from "ioredis";
import { REDIS_PORT, REDIS_URL, __prod__ } from "../constants";

// If in production, connect to Heroku Redis, otherwise connect to dockerized Redis
const redis = __prod__ ? new Redis(REDIS_URL) : new Redis(REDIS_PORT);

export { redis };
