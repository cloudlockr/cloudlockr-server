import { NextFunction, Request, Response } from "express";
import { reqCustomField } from "../types";

export default async (req: Request, _: Response, next: NextFunction) => {
  req.custom = {} as reqCustomField;
  next();
};
