import { Router } from "express";
import authController from "../controllers/authController";
import userController from "../controllers/user";

const router = Router();

router.post("/login", authController.loginController);

router.post("/register", authController.registerController);

router.post("/logout", authController.logoutController);

router.post("/refresh", authController.refreshController);

router.delete("/", userController.deleteUser);

router.get("/files", userController.getFiles);

export default router;
