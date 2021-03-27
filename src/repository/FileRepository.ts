import { AbstractRepository, EntityRepository } from "typeorm";
import { File } from "../entities/File";

@EntityRepository(File)
export class FileRepository extends AbstractRepository<File> {
  findByFileId(id?: string) {
    return this.repository.findOne(id);
  }

  async saveBlob(file: File, fileData: string, blobNumber: number) {
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

  saveMetadata(fileName: string, fileType: string) {
    // populate file entity with details about file
    const file = new File();
    file.name = fileName;
    file.fileType = fileType;
    file.numBlobs = 0;
    file.size = 0;
    file.blobs = [];
    return this.manager.save(file);
  }

  deleteById(id?: string) {
    return this.repository.delete({ id });
  }
}
