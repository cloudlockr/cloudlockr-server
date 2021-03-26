import { AbstractRepository, EntityRepository } from "typeorm";
import { File } from "../entities/File";

@EntityRepository(File)
export class FileRepository extends AbstractRepository<File> {
  findByFileId(id?: string) {
    return this.repository.findOne({ id });
  }

  async saveBlob(fileData: string, fileId: string, blobNumber: number) {
    // append the given blob to the file specified for the specific user
    // increment total number of blobs
    const file = await this.findByFileId(fileId);
    if (file === undefined) throw {code: 404, body: "File doesn't exist in database"};
    file.blobs.push(fileData);
    // file.numBlobs = file.blobs.length; // is there automated way to do this in typeorm?
    file.numBlobs = blobNumber;
  }

  async getBlob(fileId: string, blobNumber: number) {
    // retrieve blob at particular index for the given file
    const file = await this.findByFileId(fileId);
    if (file === undefined) throw {code: 404, body: "File doesn't exist in database"};
    return file.blobs[blobNumber];
  }

  saveMetadata(fileName: string, fileType: string) {
    // populate file entity with details about file
    return this.repository.create({
      name: fileName,
      fileType: fileType,
      numBlobs: 0,
      size: 0
    }).id;
  }

  async getNumBlobs(fileId: string) {
    // retrieve information about file specified by given fileId
    const file = await this.findByFileId(fileId);
    if (file === undefined) throw {code: 404, body: "File doesn't exist in database"};
    return file.numBlobs;
  }

  deleteById(id?: string) {
    return this.repository.delete({ id });
  }
}
