import { Router } from "express";
import { AuthController } from "../controllers/authController";

export class UserRouter {
  router: Router;
  private readonly authController: AuthController;

  constructor(authContoller: AuthController) {
    this.router = Router();
    this.authController = authContoller;
  }

  configureRoutes() {
    this.router.post("/login", this.authController.loginController);

    this.router.post("/register", this.authController.registerController);

    this.router.post("/logout", this.authController.logoutController);

    this.router.post("/refresh", this.authController.refreshController);

    this.router.delete("/", this.authController.deleteController);

    return this.router;
  }
}
