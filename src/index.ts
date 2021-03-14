import "dotenv/config";
import express from "express";
import session from "express-session";
import http from "http";
import logger from "morgan";
import { createConnection } from "typeorm";
import dbConfig from "./config/dbConfig";
import { attachRedis } from "./config/redisConfig";
import { sessionConfig } from "./config/sessionConfig";
import { PORT } from "./constants";
import generalRateLimiter from "./middleware/generalRateLimiter";
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
  app.use(session(sessionConfig));
  app.use(attachRedis);
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(generalRateLimiter);

  // available routes
  app.use("/file", fileRouter);
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
