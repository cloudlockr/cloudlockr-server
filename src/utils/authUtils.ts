import { sign, verify } from "jsonwebtoken";
import { JWT_LIFETIME, JWT_REFRESH_SECRET, JWT_SECRET } from "../constants";
import { payloadType } from "../types";

const createJWT = (id: string, refresh: boolean): string => {
  if (refresh) {
    return sign({ id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_LIFETIME,
    });
  } else {
    return sign({ id }, JWT_SECRET, {
      expiresIn: JWT_LIFETIME,
    });
  }
};

const verifyJWT = (token: string, refresh: boolean): payloadType => {
  let payload: payloadType;
  if (refresh) {
    payload = verify(token, JWT_REFRESH_SECRET) as payloadType;
  } else {
    payload = verify(token, JWT_SECRET) as payloadType;
  }
  return payload;
};

export { createJWT, verifyJWT };
