import { Request, Response } from "express";
import { User } from "../entities/User";

const getFiles = async (req: Request, res: Response) => {
  res.send("GET /user/files");
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.headers;
  // will add a better validator in the future
  // probably custom validator middleware
  if (!email || !password) {
    console.log("ERROR");
    res.status(400).send("ERROR");
  } else {
    console.log(email, password);
    res.send("POST /user/login");
  }
};

const register = async (req: Request, res: Response) => {
  const { email, password } = req.headers;
  console.log(email, password);
  res.send("POST /user/register");
};

const refresh = async (req: Request, res: Response) => {
  res.send("POST /user/refresh");
};

export default { getFiles, login, register, refresh };
