import connectRedis from "connect-redis";
import { NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import Redis from "ioredis";
import { v4 } from "uuid";
import {
  COOKIE_NAME,
  SESSION_LIFETIME,
  SESSION_SECRET,
  __prod__,
} from "../constants";

const RedisStore = connectRedis(session);
const redis = new Redis();

const sessionConfig: SessionOptions = {
  store: new RedisStore({ client: redis }),
  cookie: {
    secure: __prod__, // HTTPS only
    httpOnly: true, // prevent client side javascript from accessing cookie
    // domain: 'cloudlockr.com',
    // path: '/user',
    sameSite: true, // not sure if they works with React Native
    maxAge: SESSION_LIFETIME, // 15 minutes
  },
  name: COOKIE_NAME,
  genid: (_) => {
    return v4(); // use UUIDs for session IDs
  },
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
};

const attachRedis = (req: Request, _: Response, next: NextFunction) => {
  req.redis = redis;
  next();
};

export { sessionConfig, attachRedis };
