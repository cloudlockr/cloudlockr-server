import { Request, Response } from "express";
import auth from "../services/auth";

class AuthController {
  public async registerController(req: Request, res: Response) {
    try {
      const { email, password, password1 } = req.headers;

      auth.registerValidate(email, password, password1);
      const result = await auth.register(email!, password!);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async loginController(req: Request, res: Response) {
    try {
      const { email, password } = req.headers;

      const result = await auth.login(email, password);

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
      auth.authenticate(authHeader);
      const result = await auth.logout(refreshtoken);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async refreshController(req: Request, res: Response) {
    try {
      const { userid, refreshtoken } = req.headers;
      const result = await auth.refresh(userid, refreshtoken);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }
}

export default new AuthController();
