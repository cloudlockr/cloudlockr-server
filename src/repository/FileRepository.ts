import { AbstractRepository, EntityRepository } from "typeorm";
import { File, FileDTO } from "../entities/File";
import { User, UserDTO } from "../entities/User";

export interface FileDAO {
  findByFileId(id?: string): any;
  saveBlob(file: FileDTO, fileData: string, blobNumber: number): any;
  saveMetadata(user: UserDTO, fileName: string, fileType: string): any;
  deleteById(id?: string): any;
}

@EntityRepository(File)
export class FileRepository extends AbstractRepository<File> implements FileDAO {
  findByFileId(id?: string) {
    return this.repository.findOne(id);
  }

  saveBlob(file: File, fileData: string, blobNumber: number) {
    // append the given blob to the file specified for the specific user
    // increment total number of blobs
    if (blobNumber < file.numBlobs) {
      file.blobs[blobNumber] = fileData;
    } else {
      file.blobs.push(fileData);
    }
    file.numBlobs = file.blobs.length;
    return this.manager.save(file);
  }

  saveMetadata(user: User, fileName: string, fileType: string) {
    // populate file entity with details about file
    const file = new File();
    file.name = fileName;
    file.fileType = fileType;
    file.numBlobs = 0;
    file.size = 0;
    file.blobs = [];
    file.owner = user;
    return this.manager.save(file);
  }

  deleteById(id?: string) {
    return this.repository.delete({ id });
  }
}
