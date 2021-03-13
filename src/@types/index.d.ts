import { IncomingHttpHeaders } from "http";
import Redis from "ioredis";
import { Request } from "express";
import { User } from "../entities/User";
import { Session, SessionData } from "express-session";

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
    userId: string;
  }
}
