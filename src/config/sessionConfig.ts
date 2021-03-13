import connectRedis from "connect-redis";
import { NextFunction, Request, Response } from "express";
import session from "express-session";
import Redis from "ioredis";
import {
  SESSION_ID,
  SESSION_LIFETIME,
  SESSION_SECRET,
  __prod__,
} from "../constants";

const RedisStore = connectRedis(session);
const redis = new Redis();

const sessionConfig = {
  store: new RedisStore({ client: redis }),
  cookie: {
    secure: __prod__,
    httpOnly: true,
    sameSite: true,
    maxAge: SESSION_LIFETIME, // 15 minutes
  },
  name: SESSION_ID,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
};

const attachRedis = (req: Request, _: Response, next: NextFunction) => {
  req.redis = redis;
  next();
};

export { sessionConfig, attachRedis };
