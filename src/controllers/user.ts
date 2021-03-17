import { Request, Response } from "express";

const deleteUser = async (req: Request, res: Response) => {
  res.status(200).json({ ok: true, message: "Account deleted" });
};

const getFiles = async (_: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  res.send("GET /user/files");
};

export default { getFiles, deleteUser };
