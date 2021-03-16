import "reflect-metadata";
import "dotenv/config";
import express from "express";
import session from "express-session";
import http from "http";
import logger from "morgan";
import { createConnection } from "typeorm";
import dbConfig from "./config/dbConfig";
import { sessionConfig } from "./config/sessionConfig";
import { PORT } from "./constants";
import customMiddleware from "./middlewares/customMiddleware";
import generalRateLimiter from "./middlewares/generalRateLimiter";
import fileRouter from "./routes/fileRoutes";
import userRouter from "./routes/userRoutes";

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
  app.use(session(sessionConfig));
  app.use(customMiddleware);

  // routes for DE1
  app.use("/file", fileRouter);

  // routes for app, rate limited
  app.use("/user", generalRateLimiter);
  app.use("/user", userRouter);

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
