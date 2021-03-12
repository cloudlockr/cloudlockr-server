import { Router } from "express";
import userController from "../controllers/user";

const router = Router();

router.get("/files", userController.getFiles);

router.post("/login", userController.login);

router.post("/register", userController.register);

router.post("/refresh", userController.refresh);

export default router;
