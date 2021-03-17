import "express";
import "express-session";
import "http";
import { reqCustomField } from "../types";

declare module "http" {
  interface IncomingHttpHeaders {
    email?: string;
    password?: string;
    password1?: string;
  }
}

declare module "express" {
  interface Request {
    custom?: reqCustomField;
  }
}

declare module "express-session" {
  interface SessionData {
    // field to store logged in user's id
    userId: string;
    // arbitrary field for refresh endpoint to touch
    refreshTouch: boolean;
  }
}
