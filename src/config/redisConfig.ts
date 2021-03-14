import Redis from "ioredis";
import { NextFunction, Request, Response } from "express";

const redis = new Redis();

const attachRedis = (req: Request, _: Response, next: NextFunction) => {
  req.redis = redis;
  next();
};

export { redis, attachRedis };
