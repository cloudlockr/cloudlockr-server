import "express";
import "express-session";
import "http";
import Redis from "ioredis";
import { User } from "../entities/User";
import { payloadType } from "../types";

declare module "http" {
  interface IncomingHttpHeaders {
    email?: string;
    password?: string;
  }
}

declare module "express" {
  interface Request {
    redis?: Redis.Redis;
    payload?: payloadType;
    user?: User;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
