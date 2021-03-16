import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    res
      .status(401)
      .json({ ok: false, errors: [{ auth: "Not authenticated" }] });
  } else {
    next();
  }
};