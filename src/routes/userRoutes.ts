import { Router } from "express";
import isAuth from "../middleware/isAuth";
import userController from "../controllers/user";
import {
  emailValidator,
  passwordValidator,
} from "../middleware/loginValidator";
import registerValidator from "../middleware/registerValidator";

const router = Router();

router.get("/files", isAuth, userController.getFiles);

router.post(
  "/login",
  emailValidator(),
  passwordValidator(),
  userController.login
);

router.post("/register", registerValidator(), userController.register);

router.post("/logout", isAuth, userController.logout);

router.post("/refresh", isAuth, userController.refresh);

router.delete("/", isAuth, userController.deleteUser);

export default router;
