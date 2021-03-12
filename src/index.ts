import "dotenv/config";
import express from "express";
import http from "http";

const main = async () => {
  const app = express();

  const server = http.createServer(app);
  const port = process.env.PORT || 5000;

  // default index route
  app.get("/", (_, res) => {
    res.send("Hello, World!");
  });

  // 404 error
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
