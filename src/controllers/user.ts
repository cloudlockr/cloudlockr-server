import argon2 from "argon2";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";

const getFiles = async (req: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  res.send("GET /user/files");
};

const login = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    // return errors if any exist
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    res.status(422).json({ ok: false, errors });
  } else {
    // regenerate session before log in
    req.session.regenerate((_) => {
      // log user in
      req.session.userId = req.user!.id;
      req.session.touchField = true;
      res.status(200).json({ ok: true, message: "Logged in" });
    });
  }
};

const register = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    // return errors if any exist
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    res.status(422).json({ ok: false, errors });
  } else {
    // create user in database
    const { email, password } = req.headers;
    const hashedPassword = await argon2.hash(password!);
    const user = await User.create({
      email,
      password: hashedPassword,
    }).save();

    // regenerate session before log in
    req.session.regenerate((_) => {
      // log user in
      req.session.userId = user.id;
      req.session.touchField = true;
      res.status(200).json({ ok: true, message: "New account registered" });
    });
  }
};

const logout = async (req: Request, res: Response) => {
  req.session.destroy((_) => {
    // clear cookie from client side
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ ok: true, message: "Logged out" });
  });
};

const refresh = async (req: Request, res: Response) => {
  req.session.touchField = !req.session.touchField;
  res.status(200).json({ ok: true, message: "Refreshed" });
};

const deleteUser = async (req: Request, res: Response) => {
  await User.delete({ id: req.session.userId });
  // TODO: delete all user files!!!
  res.status(200).json({ ok: true, message: "Account deleted" });
};

export default { getFiles, login, register, logout, refresh, deleteUser };
