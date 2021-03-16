import { CustomValidator, header, ValidationChain } from "express-validator";
import { User } from "../entities/User";

const emailUsed: CustomValidator = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    return Promise.reject("Email invalid");
  }
  return Promise.resolve();
};

const samePassword: CustomValidator = async (password1, { req }) => {
  const password = req.headers?.password;

  if (password === password1) {
    return Promise.resolve();
  }
  return Promise.reject("Passwords don't match");
};

const registerValidator = (): Array<ValidationChain> => {
  return [
    header("email")
      .isEmail()
      .withMessage("Email invalid")
      .bail()
      .custom(emailUsed),
    header("password")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters long"),
    header("password1").custom(samePassword),
  ];
};

export default registerValidator;
