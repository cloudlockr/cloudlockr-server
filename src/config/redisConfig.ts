import Redis from "ioredis";
import { REDIS_PORT, REDIS_URL, __prod__ } from "../constants";

const redis = __prod__ ? new Redis(REDIS_URL) : new Redis(REDIS_PORT);

export { redis };
