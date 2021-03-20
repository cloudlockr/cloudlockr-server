import { Request, Response } from "express";
import { AuthServices } from "../services/auth";

export class AuthController {
  private readonly authServices: AuthServices;

  constructor(authServices: AuthServices) {
    this.authServices = authServices;

    // binding to have "this" in callback function
    this.registerController = this.registerController.bind(this);
    this.loginController = this.loginController.bind(this);
    this.logoutController = this.logoutController.bind(this);
    this.refreshController = this.refreshController.bind(this);
    this.deleteController = this.deleteController.bind(this);
  }

  // public async registerController(req: Request, res: Response) {
  public async registerController(req: Request, res: Response) {
    try {
      const { email, password, password1 } = req.headers;

      this.authServices.registerValidate(email, password, password1);
      const result = await this.authServices.register(email!, password!);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async loginController(req: Request, res: Response) {
    try {
      const { email, password } = req.headers;

      const result = await this.authServices.login(email, password);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async logoutController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];
      const { refreshtoken } = req.headers;

      // ensure user is logged in, and then log the user out
      this.authServices.authenticate(authHeader);
      const result = await this.authServices.logout(refreshtoken);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async refreshController(req: Request, res: Response) {
    try {
      const { userid, refreshtoken } = req.headers;

      const result = await this.authServices.refresh(userid, refreshtoken);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async deleteController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];
      const { refreshtoken } = req.headers;

      // ensure user is logged in, and then delete the user
      const payload = this.authServices.authenticate(authHeader);
      const result = await this.authServices.delete(payload.id, refreshtoken);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }
}
