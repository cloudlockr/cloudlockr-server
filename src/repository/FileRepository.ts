import { AbstractRepository, EntityRepository } from "typeorm";
import { File } from "../entities/File";

@EntityRepository(File)
export class FileRepository extends AbstractRepository<File> {
  findByFileId(fileId: string) {
    return this.repository.findOne({ fileId });
  }

  saveBlob(fileData: string, fileId: string, blobNumber: number) {
    // append the given blob to the file specified for the specific user
    // increment total number of blobs
    const file = findByFileId(fileId);
    file.blobs.push(fileData);
    // file.numBlobs = file.blobs.length; // is there automated way to do this in typeorm?
    file.numBlobs = blobNumber;
  }

  getBlob(fileId: string, blobNumber: number) {
    // retrieve blob at particular index for the given file
    const file = findByFileId(fileId);
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

  getNumBlobs(fileId: string) {
    // retrieve information about file specified by given fileId
    const file = findByFileId(fileId);
    return file.numBlobs;
  }

  deleteById(id?: string) {
    return this.repository.delete({ id });
  }
}