import { CustomValidator, header, ValidationChain } from "express-validator";
import { User } from "../entities/User";

const emailUsed: CustomValidator = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    return Promise.reject("Email invalid");
  }
  return Promise.resolve();
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
  ];
};

export default registerValidator;
