import { Router } from "express";
import userController from "../controllers/user";
import {
  emailValidator,
  passwordValidator,
} from "../middleware/loginValidator";
import registerValidator from "../middleware/registerValidator";

const router = Router();

router.get("/files", userController.getFiles);

router.post(
  "/login",
  emailValidator(),
  passwordValidator(),
  userController.login
);

router.post("/register", registerValidator(), userController.register);

router.post("/refresh", userController.refresh);

router.delete("/", userController.deleteUser);

export default router;
