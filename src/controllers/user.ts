import argon2 from "argon2";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { SESSION_ID } from "../constants";
import { User } from "../entities/User";

const me = async (req: Request, res: Response) => {
  res.status(200).json(req.session);
};

const getFiles = async (req: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  res.send("GET /user/files");
};

const login = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    res.status(422).json({ errors });
  } else {
    const user = req.user;

    // log user in
    req.session.userId = user!.id;

    res.status(200).json({ email: user!.email, message: "You have logged in" });
  }
};

const register = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    res.status(422).json({ errors });
  } else {
    const { email, password } = req.headers;
    const hashedPassword = await argon2.hash(password!);
    const user = await User.create({
      email,
      password: hashedPassword,
    }).save();

    // log user in
    req.session.userId = user.id;

    res.status(200).json({
      email: user.email,
      message: "You have registered for a new account",
    });
  }
};

const logout = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    res.clearCookie(SESSION_ID);
    if (err) {
      console.log(err);
    }
    res.status(200).json({ message: "You have logged out" });
  });
};

const refresh = async (req: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  res.send("POST /user/refresh");
};

const deleteUser = async (req: Request, res: Response) => {
  const { email } = req.headers;
  // TODO: ADD authentication
  await User.delete({ email });
  res.status(200).json({ message: "Your account has been deleted" });
};

export default { me, getFiles, login, register, logout, refresh, deleteUser };
