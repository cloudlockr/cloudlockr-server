import argon2 from "argon2";
import { CustomValidator, header, ValidationChain } from "express-validator";
import { User } from "../entities/User";

const emailUsed: CustomValidator = async (email, { req }) => {
  // Resolve no matter what because we only reject in password validator
  const user = await User.findOne({ where: { email } });
  if (user) {
    req.user = user;
  }
  return Promise.resolve();
};

const passwordCorrect: CustomValidator = async (password, { req }) => {
  if (req.user) {
    // If the user has entered a valid email, check whether password is correct
    if (await argon2.verify(req.user.password, password)) {
      return Promise.resolve();
    }
    // Reject because user entered incorrect password
    return Promise.reject("Incorrect email/password combination");
  }
  // Reject because user entered unregistered email
  return Promise.reject("Incorrect email/password combination");
};

const emailValidator = (): ValidationChain => {
  return header("email").custom(emailUsed);
};

const passwordValidator = (): ValidationChain => {
  return header("password").custom(passwordCorrect);
};

export { emailValidator, passwordValidator };
