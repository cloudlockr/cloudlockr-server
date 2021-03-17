import { Router } from "express";
import authController from "../controllers/authController";
import userController from "../controllers/user";
import isAuth from "../middlewares/isAuth";

const router = Router();

router.post("/login", authController.loginController);

router.post("/register", authController.registerController);

router.post("/logout", authController.logoutController);

router.post("/refresh", isAuth, userController.refresh);

router.delete("/", isAuth, userController.deleteUser);

router.get("/files", isAuth, userController.getFiles);

export default router;
