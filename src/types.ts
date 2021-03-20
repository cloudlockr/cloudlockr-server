import { User } from "./entities/User";

export type reqCustomField = {
  user?: User;
  loginLimiter?: boolean;
};
