import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../utils/authUtils";

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    // user didn't supply authorization header
    return res.status(401).json({ errors: [{ auth: "Not authenticated" }] });
  }

  const token = authorization.split(" ")[1];
  try {
    const payload = verifyJWT(token, false);
    req.payload = payload;
    return next();
  } catch (err) {
    // user supplied an invalid JWT
    return res.status(401).json({ errors: [{ auth: "Not authenticated" }] });
  }
};
