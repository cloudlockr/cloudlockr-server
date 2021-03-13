import { IncomingHttpHeaders } from "http";
import { Request } from "express";
import { User } from "../entities/User";

declare module "http" {
  interface IncomingHttpHeaders {
    email?: string;
    password?: string;
  }
}

declare module "express" {
  interface Request {
    user?: User;
  }
}
