import connectRedis from "connect-redis";
import session, { SessionOptions } from "express-session";
import { v4 } from "uuid";
import {
  COOKIE_NAME,
  SESSION_LIFETIME,
  SESSION_SECRET,
  __prod__,
} from "../constants";
import { redis } from "./redisConfig";

const RedisStore = connectRedis(session);

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

export { sessionConfig };
