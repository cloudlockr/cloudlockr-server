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

// Uses dependency injection for better testability
export class FileServices {
  private readonly userRepository: UserDAO;
  private readonly fileRepository: FileDAO;

  constructor(fileRepository: FileDAO, userRepository: UserDAO) {
    this.userRepository = userRepository;
    this.fileRepository = fileRepository;
  }

  private testUUID(fileId: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(fileId);
  }

  public async storeBlob(fileData: string, fileId: string, blobNumber: number): Promise<returnType> {
    if (!this.testUUID(fileId)) throw { code: 404, body: "fileId is not valid UUID" };

    const file = await this.fileRepository.findByFileId(fileId);
    if (!file) throw { code: 404, body: "File doesn't exist in database" };

    if (blobNumber > file.numBlobs) throw { code: 404, body: "Invalid blob number" };

    this.fileRepository.saveBlob(file, fileData, blobNumber);
    return {
      code: 200,
      body: {
        message: "Stored blob",
      },
    };
  }

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

  public async retrieveBlob(fileId: string, blobNumber: number): Promise<returnType> {
    if (!this.testUUID(fileId)) throw { code: 404, body: "fileId is not valid UUID" };

    const file = await this.fileRepository.findByFileId(fileId);
    if (!file) throw { code: 404, body: "File doesn't exist in database" };
    if (blobNumber >= file.numBlobs) throw { code: 404, body: "Invalid blob number" };

    return {
      code: 200,
      body: {
        fileData: file.blobs[blobNumber],
      },
    };
  }

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
