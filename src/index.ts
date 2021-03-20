import "dotenv/config";
import express from "express";
import http from "http";
import logger from "morgan";
import "reflect-metadata";
import { createConnection, getCustomRepository } from "typeorm";
import dbConfig from "./config/dbConfig";
import { redis } from "./config/redisConfig";
import { PORT } from "./constants";
import { AuthController } from "./controllers/authController";
import customMiddleware from "./middlewares/customMiddleware";
import { UserRepository } from "./repository/UserRepository";
import fileRouter from "./routes/fileRoutes";
import { AuthServices } from "./services/auth";

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
  app.use(customMiddleware);

  // GET index route just for some visuals on browser
  app.get("/", (_, res) => {
    res.status(200).send("Cloudlockr index page, nothing of note here");
  });

  // routes for DE1
  app.use("/file", fileRouter);

  // dependency injection
  const userRepository = getCustomRepository(UserRepository);
  const authServices = new AuthServices(userRepository, redis);
  const authController = new AuthController(authServices);

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
