import { User } from "./entities/DAOs/User.dao";

export type reqCustomField = {
  user?: User;
  loginLimiter?: boolean;
};
