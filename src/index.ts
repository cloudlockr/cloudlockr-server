import "dotenv/config";
import express from "express";
import http from "http";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { User } from "./entities/User";
import fileRouter from "./routes/fileRoutes";
import userRouter from "./routes/userRoutes";

const main = async () => {
  // creating postgres connection through TypeORM
  // const dbconn = await createConnection({
  //   type: "postgres",
  //   database: process.env.DB_NAME,
  //   entities: [User],
  //   synchronize: true,
  //   logging: !__prod__,
  // });

  const app = express();
  const server = http.createServer(app);
  const port = process.env.PORT || 5000;

  // use routes
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
