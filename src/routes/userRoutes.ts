import { Router } from "express";
import userController from "../controllers/user";
import isAuth from "../middlewares/isAuth";
import postLimiter from "../middlewares/loginRateLimiter/postLimiter";
import preLimiter from "../middlewares/loginRateLimiter/preLimiter";
import {
  emailValidator,
  passwordValidator,
} from "../middlewares/loginValidator";
import registerValidator from "../middlewares/registerValidator";

const router = Router();

router.post(
  "/login",
  preLimiter,
  emailValidator(),
  passwordValidator(),
  postLimiter,
  userController.login
);

router.post("/register", registerValidator(), userController.register);

router.post("/logout", isAuth, userController.logout);

router.post("/refresh", isAuth, userController.refresh);

router.delete("/", isAuth, userController.deleteUser);

router.get("/files", isAuth, userController.getFiles);

export default router;
