import { NextFunction, Request, Response } from "express";
import { loginLimiter } from "../../config/rateLimiterConfig";
import { LOGIN_POINTS } from "../../constants";
import emailIpKey from "../../utils/emailIpKey";

export default async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.headers;
  if (!email) {
    res.status(422).json({
      ok: false,
      errors: [{ password: "Incorrect email/password combination" }],
    });
  } else {
    const rateRes = await loginLimiter.get(emailIpKey(email, req.ip));
    if (rateRes !== null && rateRes.consumedPoints > LOGIN_POINTS) {
      res
        .status(429)
        .json({ ok: false, errors: [{ message: "Too many login requests" }] });
    } else {
      req.custom!.loginLimiter = rateRes !== null && rateRes.consumedPoints > 0;
      next();
    }
  }
};
