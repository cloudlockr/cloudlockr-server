import "express";
import "express-session";
import "http";
import { reqCustomField } from "../types";

declare module "http" {
  interface IncomingHttpHeaders {
    email?: string;
    password?: string;
    password1?: string;
    userid?: string;
    refreshtoken?: string;
  }
}

declare module "express" {
  interface Request {
    custom?: reqCustomField;
  }
}
