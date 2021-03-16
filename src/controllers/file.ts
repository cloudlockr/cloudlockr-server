import { Request, Response } from "express";

const postFile = async (_: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  res.send("POST /user/file");
};

const deleteFile = async (_: Request, res: Response) => {
  //////////////////////////
  // TODO: implement this //
  //////////////////////////
  res.send("DELETE /user/file");
};

export { postFile, deleteFile };
