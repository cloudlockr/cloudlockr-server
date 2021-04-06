/**
 * This module contains the entry point of the server.
 * It connects to the database, uses some middlewares, handles request routes,
 * and starts the server.
 */

import "reflect-metadata";
import "dotenv/config";
import express from "express";
import http from "http";
import logger from "morgan";
import { createConnection, getCustomRepository } from "typeorm";
import dbConfig from "./config/dbConfig";
import { redis } from "./config/redisConfig";
import { PORT } from "./constants";
import { AuthController } from "./controllers/authController";
import { UserRepository } from "./repository/UserRepository";
import { AuthServices } from "./services/auth";
import { FileRepository } from "./repository/FileRepository";
import { FileServices } from "./services/file";
import { FileController } from "./controllers/fileController";

const main = async () => {
  // creating postgres connection through TypeORM
  await createConnection(dbConfig);

  // create express app and server
  const app = express();
  const server = http.createServer(app);

  // middlewares
  app.disable("x-power-by");
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(logger("dev"));

  // GET index route just for some visuals on browser
  app.get("/", (_, res) => {
    res.status(200).send("Cloudlockr index page, nothing of note here");
  });

  // dependency injection
  const userRepository = getCustomRepository(UserRepository);
  const fileRepository = getCustomRepository(FileRepository);

  const authServices = new AuthServices(userRepository, redis);
  const fileServices = new FileServices(fileRepository, userRepository);

  const authController = new AuthController(authServices);
  const fileController = new FileController(fileServices, authServices);

  // routes for DE1
  app.use("/file", fileController.configureRoutes());

  // routes for app
  app.use("/user", authController.configureRoutes());

  // 404 bad request
  app.use((_, res) => {
    res.status(404).send("404 error");
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

main().catch((err) => {
  console.log(err);
});
