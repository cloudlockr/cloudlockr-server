import { FileServices } from "../services/file";

const EXIST_EMAIL = "user0@email.com";
const NON_EXIST_EMAIL = "user1@email.com";
const EXIST_FILEID0 = "9af1729e-2569-462d-a3ea-c60e18c3f098";
const EXIST_FILEID1 = "f791d187-f66c-43e2-bd11-18bd8f48b3ee";
const NON_EXIST_FILEID = "fdaf09e8-befa-452a-8ccf-aaad4b069fe0";
const NEW_FILEID = "3a37c314-08a6-44f9-ad0f-96c019ef33d6";

/**
 * Mocking dependency injection for TypeORM UserRepository
 */
class mockUserRepository {
  findById(id: string) {
    if (id === EXIST_EMAIL) {
      return { id: id };
    } else {
      return undefined;
    }
  }
}

/**
 * Mocking dependency injection for TypeORM FileRepository
 */
class mockFileRepository {
  findByFileId(id?: string) {
    if (id === EXIST_FILEID0) {
      return { id: id, name: "file0", fileType: "txt", size: 0, numBlobs: 0, blobs: [] };
    } else if (id === EXIST_FILEID1) {
      return { id: id, name: "file1", fileType: "txt", size: 3, numBlobs: 3, blobs: ["0", "1", "2"] };
    } else {
      return undefined;
    }
  }

  saveBlob(file: any, fileData: string, blobNumber: number) {
    if (blobNumber < file.numBlobs) {
      file.blobs[blobNumber] = fileData;
    } else {
      file.blobs.push(fileData);
    }
    file.numBlobs = file.blobs.length;
  }

  saveMetadata(_user: any, fileName: string, fileType: string) {
    return { id: NEW_FILEID, name: fileName, fileType: fileType };
  }

  deleteById(_id?: string) {}
}

let fileServices: FileServices;
beforeAll(() => {
  const userRepository = new mockUserRepository();
  const fileRepository = new mockFileRepository();
  fileServices = new FileServices(fileRepository as any, userRepository as any);
});

/**
 * Four tests for store file blob
 */
describe("Tests for store file blob", () => {
  test("Store file blob but file ID is not UUID", async () => {
    try {
      await fileServices.storeBlob("0", "123", 0);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("fileId is not valid UUID");
    }
  });

  test("Store file blob but file ID doesn't exist", async () => {
    try {
      await fileServices.storeBlob("0", NON_EXIST_FILEID, 0);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("File doesn't exist in database");
    }
  });

  test("Store file blob but blob number is invalid", async () => {
    try {
      await fileServices.storeBlob("0", EXIST_FILEID0, 1);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("Invalid blob number");
    }
  });

  test("Store file blob successfully", async () => {
    try {
      const result = await fileServices.storeBlob("0", EXIST_FILEID0, 0);
      expect(result.code).toBe(200);
      expect(result.body.message).toBe("Stored blob");
    } catch (err) {
      expect(true).toBe(false);
    }
  });
});

/**
 * Tests for retrieve file metadata
 */
describe("Tests for retrieve file metadata", () => {
  test("Retrieve file metadata but file ID is not UUID", async () => {
    try {
      await fileServices.retrieveFileMetadata("123");
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("fileId is not valid UUID");
    }
  });

  test("Retrieve file metadata but file ID doesn't exist", async () => {
    try {
      await fileServices.retrieveFileMetadata(NON_EXIST_FILEID);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("File doesn't exist in database");
    }
  });

  test("Retrieve file metadata successfully", async () => {
    try {
      const result = await fileServices.retrieveFileMetadata(EXIST_FILEID1);
      expect(result.code).toBe(200);
      expect(result.body.numBlobs).toBe(3);
    } catch (err) {
      expect(true).toBe(false);
    }
  });
});

/**
 * Tests for retrieve file blob
 */
describe("Tests for retrieve file blob", () => {
  test("Retrieve file blob but file ID is not UUID", async () => {
    try {
      await fileServices.retrieveBlob("123", 10);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("fileId is not valid UUID");
    }
  });

  test("Retrieve file blob but file ID doesn't exist", async () => {
    try {
      await fileServices.retrieveBlob(NON_EXIST_FILEID, 10);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("File doesn't exist in database");
    }
  });

  test("Retrieve file blob but blob number is invalid", async () => {
    try {
      await fileServices.retrieveBlob(EXIST_FILEID0, 10);
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("Invalid blob number");
    }
  });

  test("Retrieve file blob successfully", async () => {
    try {
      const result = await fileServices.retrieveBlob(EXIST_FILEID1, 2);
      expect(result.code).toBe(200);
      expect(result.body.fileData).toBe("2");
    } catch (err) {
      expect(true).toBe(false);
    }
  });
});

/**
 * Tests for create file metadata
 */
describe("Tests for create file metadata", () => {
  test("Create file metadata with no fileName or fileType", async () => {
    try {
      await fileServices.createFileMetadata(NON_EXIST_EMAIL, "", "");
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("Invalid fileName/fileType");
    }
  });

  test("Create file metadata with non existing user ID", async () => {
    try {
      await fileServices.createFileMetadata(NON_EXIST_EMAIL, "file2", "txt");
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("User doesn't exist");
    }
  });

  test("Create file metadata successfully", async () => {
    try {
      const result = await fileServices.createFileMetadata(EXIST_EMAIL, "file2", "txt");
      expect(result.code).toBe(200);
      expect(result.body.fileName).toBe("file2");
      expect(result.body.fileType).toBe("txt");
    } catch (err) {
      expect(true).toBe(false);
    }
  });
});

/**
 * Tests for delete file
 */
describe("Tests for delete file", () => {
  test("Delete file but file ID is not UUID", async () => {
    try {
      await fileServices.deleteFile("123");
      expect(true).toBe(false);
    } catch (err) {
      expect(err.code).toBe(404);
      expect(err.body).toBe("fileId is not valid UUID");
    }
  });

  test("Delete file but file ID doesn't exist", async () => {
    try {
      const result = await fileServices.deleteFile(NON_EXIST_FILEID);
      expect(result.code).toBe(200);
      expect(result.body.message).toBe("Deleted file");
    } catch (err) {
      expect(true).toBe(false);
    }
  });

  test("Delete file successfully", async () => {
    try {
      const result = await fileServices.deleteFile(EXIST_FILEID0);
      expect(result.code).toBe(200);
      expect(result.body.message).toBe("Deleted file");
    } catch (err) {
      expect(true).toBe(false);
    }
  });
});
