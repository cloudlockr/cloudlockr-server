import { NextFunction, Request, Response } from "express";
import {
  dayRateLimiter,
  hourRateLimiter,
  secondRateLimiter,
} from "../config/rateLimiterConfig";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    await secondRateLimiter.consume(req.ip);
    await hourRateLimiter.consume(req.ip);
    await dayRateLimiter.consume(req.ip);
    next();
  } catch (error) {
    res
      .status(429)
      .json({ ok: false, errors: [{ message: "Too many requests" }] });
  }
};
