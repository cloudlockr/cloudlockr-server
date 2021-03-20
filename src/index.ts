import "dotenv/config";
import "reflect-metadata";
import express from "express";
import http from "http";
import Redis from "ioredis";
import logger from "morgan";
import { createConnection, getCustomRepository } from "typeorm";
import dbConfig from "./config/dbConfig";
import { PORT } from "./constants";
import { AuthController } from "./controllers/authController";
import customMiddleware from "./middlewares/customMiddleware";
import { UserRepository } from "./repository/UserRepository";
import fileRouter from "./routes/fileRoutes";
import { UserRouter } from "./routes/userRoutes";
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

  // routes for app
  const userRepository = getCustomRepository(UserRepository);
  const redis = new Redis();
  const authServices = new AuthServices(userRepository, redis);
  const authController = new AuthController(authServices);
  const userRouter = new UserRouter(authController);
  app.use("/user", userRouter.configureRoutes());

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
