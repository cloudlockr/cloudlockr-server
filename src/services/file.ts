/**
 * This module contains the service which handles all business logic relating to
 * any use cases directly involving the Files entity
 */

import { UserDAO } from "../repository/UserRepository";
import { FileDAO } from "../repository/FileRepository";

type returnType = {
  code: number;
  body: {
    fileId?: string;
    numBlobs?: number;
    fileData?: string;
    fileName?: string;
    fileType?: string;
    message?: string;
  };
};

/**
 * Service for files, such as file metadata creation, file data storage and retrieval,
 * and file deletion
 *
 * Requires dependency injection of a FileRepository and a UserRepository
 */
export class FileServices {
  private readonly userRepository: UserDAO;
  private readonly fileRepository: FileDAO;

  constructor(fileRepository: FileDAO, userRepository: UserDAO) {
    this.userRepository = userRepository;
    this.fileRepository = fileRepository;
  }

  /**
   * Helper function for testing whether a string is of valid UUID format.
   */
  private testUUID(fileId: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(fileId);
  }

  /**
   * Stores a blob of file data in the database at the right index of the file blob array.
   * If the given fileId is not a valid UUID, an error is thrown.
   * If the given fileId does not refer to an existing file, an error is thrown.
   * If the given blob index to store the file data is invalid (invalid index), then an error is thrown.
   * Otherwise, the file data is stored and a success message is returned.
   */
  public async storeBlob(fileData: string, fileId: string, blobNumber: number): Promise<returnType> {
    if (!this.testUUID(fileId)) throw { code: 404, body: "fileId is not valid UUID" };

    const file = await this.fileRepository.findByFileId(fileId);
    if (!file) throw { code: 404, body: "File doesn't exist in database" };

    if (blobNumber > file.numBlobs || blobNumber < 0) throw { code: 404, body: "Invalid blob number" };

    await this.fileRepository.saveBlob(file, fileData, blobNumber);

    return {
      code: 200,
      body: {
        message: "Stored blob",
      },
    };
  }

  /**
   * Retrieves the metadata of a file given its ID.
   * If the given fileId is not a valid UUID, an error is thrown.
   * If the given fileId does not refer to an existing file, an error is thrown.
   * Otherwise, the file metadata, specifically the number of blobs of a file is returned.
   */
  public async retrieveFileMetadata(fileId: string): Promise<returnType> {
    if (!this.testUUID(fileId)) throw { code: 404, body: "fileId is not valid UUID" };

    const file = await this.fileRepository.findByFileId(fileId);
    if (!file) throw { code: 404, body: "File doesn't exist in database" };

    return {
      code: 200,
      body: {
        numBlobs: file.numBlobs,
      },
    };
  }

  /**
   * Retrieves a blob of file data from the database
   * If the given fileId is not a valid UUID, an error is thrown.
   * If the given fileId does not refer to an existing file, an error is thrown.
   * If the given blob index to store the file data is invalid (invalid index), then an error is thrown.
   * Otherwise, the file data is returned.
   */
  public async retrieveBlob(fileId: string, blobNumber: number): Promise<returnType> {
    if (!this.testUUID(fileId)) throw { code: 404, body: "fileId is not valid UUID" };

    const file = await this.fileRepository.findByFileId(fileId);
    if (!file) throw { code: 404, body: "File doesn't exist in database" };
    if (blobNumber >= file.numBlobs || blobNumber < 0) throw { code: 404, body: "Invalid blob number" };

    return {
      code: 200,
      body: {
        fileData: file.blobs[blobNumber],
      },
    };
  }

  /**
   * Creates a new file with the given metadata.
   * If the file name or type is missing or empty, an error is thrown.
   * If the user does not exist in the database, an error is thrown.
   * Otherwise, a new file entity is created and stored in the database, and the metadata is also returned.
   */
  public async createFileMetadata(userId: string, fileName: string, fileType: string): Promise<returnType> {
    if (!fileName || !fileType) throw { code: 404, body: "Invalid fileName/fileType" };

    const user = await this.userRepository.findById(userId);
    if (!user) throw { code: 404, body: "User doesn't exist" };

    const file = await this.fileRepository.saveMetadata(user, fileName, fileType);

    return {
      code: 200,
      body: {
        fileId: file.id,
        fileName: file.name,
        fileType: file.fileType,
      },
    };
  }

  /**
   * Deletes a file from the database.
   * If the given fileId is not a valid UUID, an error is thrown.
   * Otherwise, deletes file from database and returns a success message.
   *
   */
  public async deleteFile(fileId: string): Promise<returnType> {
    if (!this.testUUID(fileId)) throw { code: 404, body: "fileId is not valid UUID" };

    await this.fileRepository.deleteById(fileId);
    return {
      code: 200,
      body: {
        message: "Deleted file",
      },
    };
  }
}
