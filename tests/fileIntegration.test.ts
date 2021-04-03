import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import supertest from "supertest";
import { createConnection, getConnection, getCustomRepository } from "typeorm";
import { DB_FILE_TEST_URL, REDIS_PORT } from "../src/constants";
import { FileController } from "../src/controllers/fileController";
import { AuthController } from "../src/controllers/authController";
import { File } from "../src/entities/File";
import { User } from "../src/entities/User";
import { FileRepository } from "../src/repository/FileRepository";
import { UserRepository } from "../src/repository/UserRepository";
import { AuthServices } from "../src/services/auth";
import { FileServices } from "../src/services/file";

const GOOD_EMAIL0 = "user0@email.com";
const GOOD_PASSWORD = "1234567890";
const GOOD_FILE0 = {
  fileName: "file0",
  fileType: "txt",
};
let GOOD_FILEID0: string;
let BAD_FILEID: string;
const BLOB0 = "blob0";
const BLOB1 = "blob1";

let app: express.Express;
let redis: Redis.Redis;
let authController: AuthController;
let fileController: FileController;
beforeAll(async () => {
  // Create connection to test database and clear it
  await createConnection({
    type: "postgres",
    url: DB_FILE_TEST_URL,
    entities: [User, File],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  // Create connection to test redis db and clear it
  redis = new Redis({ port: REDIS_PORT, db: 1 });
  await redis.flushdb();

  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const userRepository = getCustomRepository(UserRepository);
  const fileRepository = getCustomRepository(FileRepository);
  const authServices = new AuthServices(userRepository, redis);
  const fileServices = new FileServices(fileRepository, userRepository);
  authController = new AuthController(authServices);
  fileController = new FileController(fileServices, authServices);

  app.use("/user", authController.configureRoutes());
  app.use("/file", fileController.configureRoutes());
});

afterAll(async () => {
  const conn = getConnection();
  await conn.close();

  await redis.quit();
});

describe("Tests for create file metadata endpoint", () => {
  test("Create file metadata with undefined header", async () => {
    const response = await supertest(app).post("/file");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Create file metadata with invalid access token", async () => {
    const response = await supertest(app).post("/file").set("authorization", "bearer 123");

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Invalid access token");
  });

  test("Create file metadata with valid access token but no request body", async () => {
    let response = await supertest(app)
      .post("/user/register")
      .set("email", GOOD_EMAIL0)
      .set("password", GOOD_PASSWORD)
      .set("password1", GOOD_PASSWORD);

    expect(response.status).toBe(201);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app).post("/file").set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("Invalid fileName/fileType");
  });

  test("Create file metadata with valid inputs, but delete user in process", async () => {
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

    response = await supertest(app).post("/file").set("authorization", `${token_type} ${accessToken}`).send(GOOD_FILE0);

    expect(response.status).toBe(404);
    expect(response.body).toBe("User doesn't exist");
  });

  test("Create file metadata with valid inputs", async () => {
    let response = await supertest(app)
      .post("/user/register")
      .set("email", GOOD_EMAIL0)
      .set("password", GOOD_PASSWORD)
      .set("password1", GOOD_PASSWORD);

    expect(response.status).toBe(201);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app).post("/file").set("authorization", `${token_type} ${accessToken}`).send(GOOD_FILE0);

    expect(response.status).toBe(200);
    expect(response.body.fileId).toBeTruthy();
    expect(response.body.fileName).toBe(GOOD_FILE0.fileName);
    expect(response.body.fileType).toBe(GOOD_FILE0.fileType);

    GOOD_FILEID0 = response.body.fileId;
    BAD_FILEID = GOOD_FILEID0.substring(0, 35);
    const lastChar = GOOD_FILEID0.substring(36);
    for (let i = 0; i < 2; i++) {
      if (i.toString() !== lastChar) {
        BAD_FILEID = BAD_FILEID + i.toString();
        break;
      }
    }
  });
});

describe("Tests for retrieve file metadata endpoint", () => {
  test("Retrieve file metadata with non UUID file ID", async () => {
    let response = await supertest(app).get("/file/123");

    expect(response.status).toBe(404);
    expect(response.body).toBe("fileId is not valid UUID");
  });

  test("Retrieve file metadata with nonexisting file", async () => {
    let response = await supertest(app).get(`/file/${BAD_FILEID}`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("File doesn't exist in database");
  });

  test("Retrieve file metadata successfully", async () => {
    let response = await supertest(app).get(`/file/${GOOD_FILEID0}`);

    expect(response.status).toBe(200);
    expect(response.body.numBlobs).toBe(0);
  });
});

describe("Tests for store file blob", () => {
  test("Store file blob with non UUID file ID", async () => {
    let response = await supertest(app).post("/file/123/0");

    expect(response.status).toBe(404);
    expect(response.body).toBe("fileId is not valid UUID");
  });

  test("Store file blob with nonexisting file", async () => {
    let response = await supertest(app).post(`/file/${BAD_FILEID}/0`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("File doesn't exist in database");
  });

  test("Store file blob with bad blob number", async () => {
    let response = await supertest(app).post(`/file/${GOOD_FILEID0}/1`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("Invalid blob number");
  });

  test("Store file blob successfully", async () => {
    let response = await supertest(app).post(`/file/${GOOD_FILEID0}/0`).send({ fileData: BLOB0 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Stored blob");

    response = await supertest(app).post(`/file/${GOOD_FILEID0}/1`).send({ fileData: BLOB1 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Stored blob");

    // Confirming that the two blobs are stored
    response = await supertest(app).get(`/file/${GOOD_FILEID0}`);

    expect(response.status).toBe(200);
    expect(response.body.numBlobs).toBe(2);

    // Get files
    response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app).get("/user/files").set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Files found");

    const fileMetadata = response.body.filesMetadata;
    expect(fileMetadata.length).toBe(1);
    expect(fileMetadata[0].id).toBe(GOOD_FILEID0);
    expect(fileMetadata[0].name).toBe(GOOD_FILE0.fileName);
    expect(fileMetadata[0].fileType).toBe(GOOD_FILE0.fileType);
  });
});

describe("Tests for retrieve file blob", () => {
  test("Retrieve file blob with non UUID file ID", async () => {
    let response = await supertest(app).get("/file/123/0");

    expect(response.status).toBe(404);
    expect(response.body).toBe("fileId is not valid UUID");
  });

  test("Retrieve file blob with nonexisting file", async () => {
    let response = await supertest(app).get(`/file/${BAD_FILEID}/0`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("File doesn't exist in database");
  });

  test("Retrieve file blob with bad blob number", async () => {
    let response = await supertest(app).get(`/file/${GOOD_FILEID0}/3`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("Invalid blob number");
  });

  test("Retrieve file blobs successfully", async () => {
    let response = await supertest(app).get(`/file/${GOOD_FILEID0}/0`);

    expect(response.status).toBe(200);
    expect(response.body.fileData).toBe(BLOB0);

    response = await supertest(app).get(`/file/${GOOD_FILEID0}/1`);

    expect(response.status).toBe(200);
    expect(response.body.fileData).toBe(BLOB1);
  });
});

describe("Tests for delete file", () => {
  test("Delete file with undefined header", async () => {
    const response = await supertest(app).delete("/file/123");

    expect(response.status).toBe(401);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("No access token");
  });

  test("Delete file with invalid access token", async () => {
    const response = await supertest(app).delete("/file/123").set("authorization", "bearer 123");

    expect(response.status).toBe(403);
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0].auth).toBe("Invalid access token");
  });

  test("Delete file with valid accesstoken but invalid file ID", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app).delete("/file/123").set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("fileId is not valid UUID");
  });

  test("Delete file with valid accesstoken and valid file ID", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app)
      .delete(`/file/${GOOD_FILEID0}`)
      .set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Deleted file");

    // Ensure that file is actually deleted
    response = await supertest(app).get(`/file/${GOOD_FILEID0}`);

    expect(response.status).toBe(404);
    expect(response.body).toBe("File doesn't exist in database");
  });

  test("Delete file with valid accesstoken and nonexisting file ID", async () => {
    let response = await supertest(app).post("/user/login").set("email", GOOD_EMAIL0).set("password", GOOD_PASSWORD);

    expect(response.status).toBe(200);

    const accessToken = response.body.accessToken;
    const token_type = response.body.token_type;

    response = await supertest(app)
      .delete(`/file/${GOOD_FILEID0}`)
      .set("authorization", `${token_type} ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Deleted file");
  });
});
