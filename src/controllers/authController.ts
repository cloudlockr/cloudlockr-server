import { Request, Response } from "express";
import { COOKIE_NAME } from "../constants";
import auth from "../services/auth";

class AuthController {
  public async registerController(req: Request, res: Response) {
    try {
      const { email, password, password1 } = req.headers;

      auth.registerValidate(email, password, password1);
      const result = await auth.register(req.session, email!, password!);

      res.status(result.code).json({ ok: true, message: result.message });
    } catch (err) {
      res.status(err.code).json({ ok: false, errors: err.errors });
    }
  }

  public async loginController(req: Request, res: Response) {
    try {
      const { email, password } = req.headers;

      const result = await auth.login(req.session, email, password);

      res.status(result.code).json({ ok: true, message: result.message });
    } catch (err) {
      res.status(err.code).json({ ok: false, errors: err.errors });
    }
  }

  public async logoutController(req: Request, res: Response) {
    try {
      console.log(req.session);
      auth.authenticated(req.session);
      const result = await auth.logout(req.session);

      // clear cookie from client side
      res.clearCookie(COOKIE_NAME);
      res.status(result.code).json({ ok: true, message: result.message });
    } catch (err) {
      res.status(err.code).json({ ok: false, errors: err.errors });
    }
  }
}

export default new AuthController();
