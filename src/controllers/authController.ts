/**
 * This module defines the interface between Express.js and the authentication service.
 * Everything relating to Express.js request/response, error handling, is done here,
 * while business logic which defines our use cases is defined in the "auth.ts" file.
 */

import { Request, Response, Router } from "express";
import { AuthServices } from "../services/auth";

/**
 * Controller for all authentication API endpoints
 * Serves as an interface between express requests/responses and services containing business logic
 *
 * Currently controls endpoints:
 * - user register
 * - user login
 * - user logout
 * - user refresh to acquire new access and fresh token
 * - user delete account
 * - user get all files
 */
export class AuthController {
  private readonly router: Router;
  private readonly authServices: AuthServices;

  constructor(authServices: AuthServices) {
    this.authServices = authServices;
    this.router = Router();

    // binding to have "this" in callback function
    this.registerController = this.registerController.bind(this);
    this.loginController = this.loginController.bind(this);
    this.logoutController = this.logoutController.bind(this);
    this.refreshController = this.refreshController.bind(this);
    this.deleteController = this.deleteController.bind(this);
    this.getFilesController = this.getFilesController.bind(this);
  }

  /**
   * User register API endpoint, calls validation and register services.
   * Performs error handling if necessary
   */
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

  /**
   * User login API endpoint, calls login service. Performs error handling if necessary
   */
  public async loginController(req: Request, res: Response) {
    try {
      const { email, password } = req.headers;

      const result = await this.authServices.login(email, password);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  /**
   * User logout API endpoint, calls authenticate service to ensure user is logged in,
   * and then calls the logout service. Performs error handling if necessary
   */
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

  /**
   * User refresh access token API endpoint, calls refresh service. Performs error handling if necessary
   */
  public async refreshController(req: Request, res: Response) {
    try {
      const { userid, refreshtoken } = req.headers;

      const result = await this.authServices.refresh(userid, refreshtoken);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  /**
   * User delete account API endpoint, calls authenticate service to ensure user is logged in,
   * and then calls the delete service. Performs error handling if necessary
   */
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

  /**
   * Get user files API endpoint, calls authenticate service to ensure user is logged in,
   * and then calls the getFiles service. Performs error handling if necessary
   */
  public async getFilesController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];

      // ensure user is logged in, and then get all user files
      const payload = this.authServices.authenticate(authHeader);
      const result = await this.authServices.getFiles(payload.id);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  /**
   * Configuration for the express router, defines the HTTP methods and URL for each API endpoints
   */
  public configureRoutes() {
    this.router.post("/login", this.loginController);

    this.router.post("/register", this.registerController);

    this.router.post("/logout", this.logoutController);

    this.router.post("/refresh", this.refreshController);

    this.router.delete("/", this.deleteController);

    this.router.get("/files", this.getFilesController);

    return this.router;
  }
}
