import "express";
import "express-session";
import "http";
import Redis from "ioredis";
import { User } from "../entities/User";
import { jsonResponse } from "../types";

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

  interface Response {
    json: (body?: jsonResponse) => Response<any, Record<string, any>>;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
