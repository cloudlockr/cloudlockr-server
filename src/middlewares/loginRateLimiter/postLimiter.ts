import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { loginLimiter } from "../../config/rateLimiterConfig";
import { redis } from "../../config/redisConfig";
import { LOGIN_BLOCK, LOGIN_NAME } from "../../constants";
import emailIpKey from "../../utils/emailIpKey";

export default async (req: Request, res: Response, next: NextFunction) => {
  const errorObj = validationResult(req);
  const emailIp = emailIpKey(req.headers.email!, req.ip);
  const redisKey = `${LOGIN_NAME}_${emailIp}`;

  if (!errorObj.isEmpty()) {
    try {
      const rateRes = await loginLimiter.consume(emailIp);

      if (rateRes.remainingPoints <= 0) {
        // everytime a user fails login more than 5 times consecutively, dynamically increase block duration
        const blockDur = await redis.get(redisKey);

        if (!blockDur) {
          // we haven't set login block duration in redis yet
          await redis.set(redisKey, LOGIN_BLOCK);
          loginLimiter.block(emailIp, LOGIN_BLOCK);
        } else {
          // multiply login block duration by 4
          const realBlockDur = parseInt(blockDur) * 4;
          await redis.set(redisKey, realBlockDur);
          loginLimiter.block(emailIp, realBlockDur);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      const errors: Array<any> = [];
      errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
      res.status(422).json({ ok: false, errors });
    }
  } else {
    // reset login rate limiter points and block duration if login successful
    await redis.del(redisKey);
    if (req.custom!.loginLimiter) {
      await loginLimiter.delete(emailIp);
    }
    next();
  }
};
