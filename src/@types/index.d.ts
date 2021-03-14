import "express";
import "express-session";
import "http";
import Redis from "ioredis";
import { User } from "../entities/User";

declare module "http" {
  interface IncomingHttpHeaders {
    email?: string;
    password?: string;
  }
}

declare module "express" {
  interface Request {
    redis?: Redis.Redis;
    user?: User;
  }
}

declare module "express-session" {
  interface SessionData {
    // field to store logged in user's id
    userId: string;
    // arbitrary field for refresh endpoint to touch
    touchField: boolean;
  }
}
