//import argon2 from "argon2";
//import { Redis } from "ioredis";
//import { sign, verify } from "jsonwebtoken";
//import {
//  REFRESH_LIFETIME,
//  REFRESH_PREFIX,
//  REFRESH_SECRET,
//  TOKEN_LIFETIME,
//  TOKEN_SECRET,
//} from "../constants";
import { User } from "../entities/User";
import { UserRepository } from "../repository/UserRepository";
import { File } from "../entities/File";
import { FileRepository } from "../repository/FileRepository";

// Uses dependency injection for better testability
export class FileServices {
  private readonly userRepository: UserRepository;
  private readonly fileRepository: FileRepository;
  //private readonly redis: Redis;

  constructor(fileRepository: FileRepository, userRepository: UserRepository/*, redis: Redis*/) {
    this.userRepository = userRepository;
    this.fileRepository = fileRepository;
    //this.redis = redis;
  }

  public createFileMetadata(fileName: string, fileType: string) {
    const fileId = this.fileRepository.saveMetadata(fileName, fileType);
    return {
      code: 200,
      body: {
        fileId: fileId
      }
    };
  }

  public retrieveFileMetadata(email: string, fileId: string) {
    this.userRepository.findByEmail(email);
    const numBlobs = this.fileRepository.getNumBlobs(fileId);
    return {
      code: 200,
      body: {
        numBlobs: numBlobs
      }
    };
  }

  public storeBlob(email: string, fileData: string, fileId: string, blobNumber: number) {
    this.userRepository.findByEmail(email);
    this.fileRepository.saveBlob(fileData, fileId, blobNumber);
    return {
      code: 200,
    };
  }

  public retrieveBlob(email: string, fileId: string, blobNumber: number) {
    this.userRepository.findByEmail(email);
    const fileData = this.fileRepository.getBlob(fileId, blobNumber);
    return {
      code: 200,
      body: {
        fileData: fileData
      }
    };
  }

  public deleteFile(fileId: string) {
    this.fileRepository.deleteById(fileId);
    return {
      code: 200
    };
  }
}
