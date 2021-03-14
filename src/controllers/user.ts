import argon2 from "argon2";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { createJWT, verifyJWT } from "../utils/authUtils";

const me = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "COOLIO!" });
};

const getFiles = async (req: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  return res.send("GET /user/files");
};

const login = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    // return errors if any exist
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    res.status(422).json({ errors });
  }

  // log user in with JWT
  const user = req.user;
  res.cookie(COOKIE_NAME, createJWT(user!.id, true), {
    httpOnly: true,
  });

  res.status(200).json({
    token: createJWT(user!.id, false),
    message: "You have logged in",
  });
};

const register = async (req: Request, res: Response) => {
  const errorObj = validationResult(req);
  if (!errorObj.isEmpty()) {
    // return errors if any exist
    const errors: Array<any> = [];
    errorObj.array().map((err) => errors.push({ [err.param]: err.msg }));
    return res.status(422).json({ errors });
  }

  // create user and log in with JWT
  const { email, password } = req.headers;
  const hashedPassword = await argon2.hash(password!);
  const user = await User.create({
    email,
    password: hashedPassword,
  }).save();

  res.cookie(COOKIE_NAME, createJWT(user.id, true), {
    httpOnly: true,
  });

  return res.status(200).json({
    token: createJWT(user.id, false),
    message: "You have registered for a new account",
  });
};

const logout = async (req: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  return res.status(200).json({ message: "You have logged out" });
};

const refresh = async (req: Request, res: Response) => {
  // DO WE REALLY NEED A REFRESH TOKEN?
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    // user didn't supply refresh JWT
    return res
      .status(401)
      .json({ errors: [{ auth: "Refresh token invalid" }] });
  }
  try {
    verifyJWT(token, true);
  } catch (err) {
    // user supplied an invalid refresh JWT
    return res
      .status(401)
      .json({ errors: [{ auth: "Refresh token invalid" }] });
  }

  const user = await User.findOne({ id: req.payload?.id });
  if (!user) {
    return res
      .status(404)
      .json({ errors: [{ message: "Account no longer exists" }] });
  }

  return res.status(200).json({
    token: createJWT(user.id, false),
    message: "Access token refreshed",
  });
};

const deleteUser = async (req: Request, res: Response) => {
  await User.delete({ id: req.payload?.id });
  // TODO: delete all user files!!!
  return res.status(200).json({ message: "Your account has been deleted" });
};

export default { me, getFiles, login, register, logout, refresh, deleteUser };
