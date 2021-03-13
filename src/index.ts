import "dotenv/config";
import express from "express";
import session from "express-session";
import http from "http";
import logger from "morgan";
import { createConnection } from "typeorm";
import dbConfig from "./config/dbConfig";
import { attachRedis, sessionConfig } from "./config/sessionConfig";
import fileRouter from "./routes/fileRoutes";
import userRouter from "./routes/userRoutes";

const main = async () => {
  // creating postgres connection through TypeORM
  await createConnection(dbConfig);

  // create express app and server
  const app = express();
  const server = http.createServer(app);
  const port = process.env.PORT || 5000;

  // middlewares
  app.use(session(sessionConfig));
  app.use(attachRedis);
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // available routes
  app.use("/file", fileRouter);
  app.use("/user", userRouter);

  // 404 bad request
  app.use((_, res) => {
    res.status(404).send("404 error");
  });

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

main().catch((err) => {
  console.log(err);
});
