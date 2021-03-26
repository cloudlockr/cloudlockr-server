import { Request, Response, Router } from "express";
import { FileServices } from "../services/file";
import { AuthServices } from "../services/auth";

export class FileController {
  private readonly router: Router;
  private readonly fileServices: FileServices;
  private readonly authServices: AuthServices;

  constructor(fileServices: FileServices, authServices: AuthServices) {
    this.fileServices = fileServices;
    this.authServices = authServices;
    this.router = Router();

    this.createFileMetadataController = this.createFileMetadataController.bind(this);
    this.storeBlobController = this.storeBlobController.bind(this);
    this.retrieveFileMetadataController = this.retrieveFileMetadataController.bind(this);
    this.retrieveBlobController = this.retrieveBlobController.bind(this);
    this.deleteFileController = this.deleteFileController.bind(this);
  }

  public async createFileMetadataController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];
      const { fileName, fileType } = req.body;
      // login
      this.authServices.authenticate(authHeader);
      result = this.fileServices.createFileMetadata(fileName, fileType);
      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async storeBlobController(req: Request, res: Response) {
    try {
      const { email } = req.headers;
      const { fileData } = req.body;
      // fetch fileId, blobNumber from url
      const { fileId, blobNumber } = req.params;
      result = this.fileServices.storeBlob(email, fileData, fileId, blobNumber);
      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async retrieveFileMetadataController(req: Request, res: Response) {
    try {
      const { email } = req.headers;
      const { fileId } = req.params;
      result = this.fileServices.retrieveFileMetadata(email, fileId);
      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async retrieveBlobController(req: Request, res: Response) {
    try {
      const { email } = req.headers;
      const { fileId, blobNumber } = req.params;
      result = this.fileServices.retrieveBlob(email, fileId, blobNumber);
      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async deleteFileController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];
      const { fileId } = req.params;
      this.authServices.authenticate(authHeader);
      result = this.fileServices.deleteFile(fileId);
      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public configureRoutes() {
    this.router.post("/:fileId/:blobNumber", this.storeBlobController);
    this.router.get("/:fileId/:blobNumber", this.retrieveBlobController);
    this.router.get("/:fileId", this.retrieveFileMetadataController);
    this.router.post("/", this.createFileMetadataController);
    this.router.delete("/:fileId", this.retrieveFileMetadataController);
    return this.router;
  }
}
