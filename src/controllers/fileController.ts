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

  public async storeBlobController(req: Request, res: Response) {
    try {
      const { fileData } = req.body;
      // fetch fileId, blobNumber from url
      const { fileId, blobNumber } = req.params;

      const result = await this.fileServices.storeBlob(fileData, fileId, Number(blobNumber));

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async retrieveFileMetadataController(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const result = await this.fileServices.retrieveFileMetadata(fileId);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async retrieveBlobController(req: Request, res: Response) {
    try {
      const { fileId, blobNumber } = req.params;

      const result = await this.fileServices.retrieveBlob(fileId, Number(blobNumber));

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  public async createFileMetadataController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];
      const { fileName, fileType } = req.body;
      // login
      const payload = this.authServices.authenticate(authHeader);
      const result = await this.fileServices.createFileMetadata(payload.id, fileName, fileType);

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
      const result = await this.fileServices.deleteFile(fileId);

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
    this.router.delete("/:fileId", this.deleteFileController);
    return this.router;
  }
}
