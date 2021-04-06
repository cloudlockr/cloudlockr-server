/**
 * This module contains the FileDAO, which specifies the methods used for file CRUD operations.
 * Defining DAOs allow for easy dependency injection, as no matter which ORM is used, as long as
 * we can define custom methods for CRUD which aligns with the interface defined in the DAO,
 * it can be injected into wherever it needs to be used without changing any other code.
 *
 * The FileRepository defines the custom methods for TypeORM to perform CRUD operations on the
 * File entity in the database.
 */

import { AbstractRepository, EntityRepository } from "typeorm";
import { File, FileDTO } from "../entities/File";
import { User, UserDTO } from "../entities/User";

/**
 * The required file CRUD operations are:
 *  findByFileId: Query the database for the file entity given its ID
 *  saveBlob: Insert a new blob of file data into the database at the right position of the given file entity
 *  saveMetadata: Insert a new file entity into the database table with the given inputs
 *  deleteById: Delete a file entity from the database given its ID
 */
export interface FileDAO {
  findByFileId(id?: string): any;
  saveBlob(file: FileDTO, fileData: string, blobNumber: number): any;
  saveMetadata(user: UserDTO, fileName: string, fileType: string): any;
  deleteById(id?: string): any;
}

/**
 * Implements the required file CRUD operations for TypeORM
 */
@EntityRepository(File)
export class FileRepository extends AbstractRepository<File> implements FileDAO {
  findByFileId(id?: string) {
    return this.repository.findOne(id);
  }

  saveBlob(file: File, fileData: string, blobNumber: number) {
    // Add new file data to the correct index
    if (blobNumber < file.numBlobs) {
      file.blobs[blobNumber] = fileData;
    } else {
      file.blobs.push(fileData);
    }
    file.numBlobs = file.blobs.length;
    return this.manager.save(file);
  }

  saveMetadata(user: User, fileName: string, fileType: string) {
    // Populate file entity with details about file
    const file = new File();
    file.name = fileName;
    file.fileType = fileType;
    file.numBlobs = 0;
    file.size = 0;
    file.blobs = [];
    file.owner = user; // Set the owner of this file
    return this.manager.save(file);
  }

  deleteById(id?: string) {
    return this.repository.delete({ id });
  }
}
