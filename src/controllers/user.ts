import argon2 from "argon2";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../entities/User";

const getFiles = async (req: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  console.log(req.session.userId);
  res.send("GET /user/files");
};

const login = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    return res.status(422).json({ errors });
  }

  const user = req.user;

  // log user in
  req.session.userId = user!.id;

  return res.status(200).json({ email: user!.email });
};

const register = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    return res.status(422).json({ errors });
  }

  const { email, password } = req.headers;
  const hashedPassword = await argon2.hash(password!);
  const user = await User.create({
    email,
    password: hashedPassword,
  }).save();

  // log user in
  req.session.userId = user.id;

  return res.status(200).json({ email: user.email });
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
  return res.status(200).json({ deleted: true });
};

export default { getFiles, login, register, refresh, deleteUser };
