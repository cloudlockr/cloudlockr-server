import connectRedis from "connect-redis";
import { NextFunction, Request, Response } from "express";
import session from "express-session";
import Redis from "ioredis";
import { __prod__ } from "../constants";

const RedisStore = connectRedis(session);
const redis = new Redis();

const sessionConfig = {
  store: new RedisStore({
    client: redis,
    disableTouch: true,
  }),
  cookie: {
    secure: __prod__,
    httpOnly: true,
    sameSite: true,
    maxAge: 1000 * 60 * 15, // 15 minutes
  },
  name: process.env.SESSION_ID,
  secret: process.env.SESSION_SECRET || "secret sauce",
  resave: false,
  saveUninitialized: false,
};

const attachRedis = (req: Request, _: Response, next: NextFunction) => {
  req.redis = redis;
  next();
};

export { sessionConfig, attachRedis };
