import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import supertest from "supertest";
import { createConnection, getConnection, getCustomRepository } from "typeorm";
import { DB_AUTH_TEST_URL, REDIS_PORT } from "../src/constants";
import { AuthController } from "../src/controllers/authController";
import { File } from "../src/entities/File";
import { User } from "../src/entities/User";
import { UserRepository } from "../src/repository/UserRepository";
import { AuthServices } from "../src/services/auth";

const GOOD_EMAIL0 = "user0@email.com";
const GOOD_EMAIL1 = "user1@email.com";
const BAD_EMAIL = "useremail.com";
const GOOD_PASSWORD = "1234567890";
const BAD_PASSWORD = "12345";
const BAD_ID = "123";
const BAD_TOKEN = "123";

let app: express.Express;
let redis: Redis.Redis;
let authController: AuthController;
beforeAll(async () => {
  // Create connection to test database and clear it
  await createConnection({
    type: "postgres",
    url: DB_AUTH_TEST_URL,
    entities: [User, File],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  // Create connection to test redis db and clear it
  redis = new Redis({ port: REDIS_PORT, db: 1 });
  await redis.flushdb();

  app = express();
  const userRepository = getCustomRepository(UserRepository);
  const authServices = new AuthServices(userRepository, redis);
  authController = new AuthController(authServices);
  app.use("/user", authController.configureRoutes());
});

afterAll(async () => {
  const conn = getConnection();
  await conn.close();

  await redis.quit();
});

describe("Tests for register API endpoint", () => {
  test("Register with undefined headers", async () => {
    const response = await supertest(app).post("/user/register");

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(2);
    expect(response.body.errors[0].email).toBe("Email invalid");
    expect(response.body.errors[1].password).toBe("Password must be at least 10 characters long");
  });

  test("Register with invalid email and short password", async () => {
    const response = await supertest(app).post("/user/register").set("email", BAD_EMAIL).set("password", BAD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(3);
    expect(response.body.errors[0].email).toBe("Email invalid");
    expect(response.body.errors[1].password).toBe("Password must be at least 10 characters long");
    expect(response.body.errors[2].password1).toBe("Passwords do not match");
  });

  test("Register with valid email but unmatching passwords", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .set("email", GOOD_EMAIL0)
      .set("password", GOOD_PASSWORD)
      .set("password1", BAD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].password1).toBe("Passwords do not match");
  });

  test("Register with valid inputs", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .set("email", GOOD_EMAIL0)
      .set("password", GOOD_PASSWORD)
      .set("password1", GOOD_PASSWORD);

    expect(response.status).toBe(201);
    expect(response.body.userId).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.token_type).toBe("bearer");
    expect(response.body.expires).toBe(900);
    expect(response.body.message).toBe("New account registered");
  });

  test("Register with duplicate email", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .set("email", GOOD_EMAIL0)
      .set("password", GOOD_PASSWORD)
      .set("password1", GOOD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].email).toBe("Email already registered");
  });
});

describe("Tests for login API endpoint", () => {
  test("Login with undefined headers", async () => {
    const response = await supertest(app).post("/user/login");

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].email).toBe("Incorrect email/password combination");
  });

  test("Login with bad headers", async () => {
    const response = await supertest(app).post("/user/login").set("email", BAD_EMAIL).set("password", BAD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].email).toBe("Incorrect email/password combination");
  });

  test("Login with incorrect password", async () => {
    const response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", BAD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].email).toBe("Incorrect email/password combination");
  });

  test("Login with correct email/password combination", async () => {
    const response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.token_type).toBe("bearer");
    expect(response.body.expires).toBe(900);
    expect(response.body.message).toBe("Logged in");
  });
});

describe("Tests for logout API endpoint", () => {
  test("Logout with undefined headers", async () => {
    const response = await supertest(app).post("/user/logout");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Logout with bad authorization header", async () => {
    const response = await supertest(app).post("/user/logout").set("authorization", "123");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Logout with invalid access token", async () => {
    const response = await supertest(app).post("/user/logout").set("authorization", "bearer 123");

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Invalid access token");
  });

  test("Logout with valid access token but no refresh token", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app).post("/user/logout").set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No refresh token");
  });

  test("Logout with refresh token but no access token", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const refreshToken = response.body.refreshToken;

    response = await supertest(app).post("/user/logout").set("refreshtoken", refreshToken);

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Logout with valid access token and refresh token", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;
    const refreshToken = response.body.refreshToken;

    response = await supertest(app)
      .post("/user/logout")
      .set("authorization", `${token_type} ${accessToken}`)
      .set("refreshtoken", refreshToken);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logged out");
  });
});

describe("Tests for refresh API endpoint", () => {
  test("Refresh with undefined headers", async () => {
    let response = await supertest(app).post("/user/refresh");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(2);
    expect(response.body.errors[0].auth).toBe("No user id");
    expect(response.body.errors[1].auth).toBe("No refresh token");

    response = await supertest(app).post("/user/refresh").set("userid", BAD_ID);

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No refresh token");

    response = await supertest(app).post("/user/refresh").set("refreshtoken", BAD_TOKEN);

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No user id");
  });

  test("Refresh with invalid/expired refresh token", async () => {
    const response = await supertest(app).post("/user/refresh").set("userid", BAD_ID).set("refreshtoken", BAD_TOKEN);

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Invalid refresh token");
  });

  test("Refresh with revoked refresh token", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;
    const refreshToken = response.body.refreshToken;
    const userId = response.body.userId;

    response = await supertest(app)
      .post("/user/logout")
      .set("authorization", `${token_type} ${accessToken}`)
      .set("refreshtoken", refreshToken);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logged out");

    response = await supertest(app).post("/user/refresh").set("userid", userId).set("refreshtoken", refreshToken);

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Revoked refresh token");
  });

  test("Refresh with unmatching user ID", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const refreshToken = response.body.refreshToken;

    response = await supertest(app).post("/user/refresh").set("userid", BAD_ID).set("refreshtoken", refreshToken);

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Invalid user token pair");
  });

  test("Refresh with valid inputs", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const refreshToken = response.body.refreshToken;
    const userId = response.body.userId;

    response = await supertest(app).post("/user/refresh").set("userid", userId).set("refreshtoken", refreshToken);

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.token_type).toBe("bearer");
    expect(response.body.expires).toBe(900);
    expect(response.body.message).toBe("Refreshed");
  });
});

describe("Tests for delete API endpoint", () => {
  test("Delete with undefined headers", async () => {
    const response = await supertest(app).delete("/user");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Delete with bad authorization header", async () => {
    const response = await supertest(app).delete("/user").set("authorization", "123");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Delete with invalid access token", async () => {
    const response = await supertest(app).delete("/user").set("authorization", "bearer 123");

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Invalid access token");
  });

  test("Delete with valid access token but no refresh token", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app).delete("/user").set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No refresh token");
  });

  test("Delete with valid access token and refresh token", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;
    const refreshToken = response.body.refreshToken;

    response = await supertest(app)
      .delete("/user")
      .set("authorization", `${token_type} ${accessToken}`)
      .set("refreshtoken", refreshToken);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Account deleted");

    // Verify that user is actually deleted
    response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].email).toBe("Incorrect email/password combination");
  });

  test("Delete with valid access token and invalid refresh token", async () => {
    let response = await supertest(app)
      .post("/user/register")
      .set("email", GOOD_EMAIL1)
      .set("password", GOOD_PASSWORD)
      .set("password1", GOOD_PASSWORD);

    expect(response.status).toBe(201);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app)
      .delete("/user")
      .set("authorization", `${token_type} ${accessToken}`)
      .set("refreshtoken", BAD_TOKEN);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Account deleted");

    // Verify that user is actually deleted
    response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL1).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(422);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].email).toBe("Incorrect email/password combination");
  });
});
