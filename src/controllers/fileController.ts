/**
 * This module defines the interface between Express.js and the file service.
 * Everything relating to Express.js request/response, error handling, is done here,
 * while business logic which defines our use cases is defined in the "file.ts" file.
 */

import { Request, Response, Router } from "express";
import { FileServices } from "../services/file";
import { AuthServices } from "../services/auth";

/**
 * Controller for all API endpoints relating to files
 * Serves as an interface between express requests/responses and services containing business logic
 *
 * Currently controls endpoints:
 * - store file data
 * - retrieve file metadata
 * - retrieve file data
 * - create new file metadata
 * - delete file
 */
export class FileController {
  private readonly router: Router;
  private readonly fileServices: FileServices;
  private readonly authServices: AuthServices;

  constructor(fileServices: FileServices, authServices: AuthServices) {
    this.fileServices = fileServices;
    this.authServices = authServices;
    this.router = Router();

    // binding to have "this" in callback function
    this.createFileMetadataController = this.createFileMetadataController.bind(this);
    this.storeBlobController = this.storeBlobController.bind(this);
    this.retrieveFileMetadataController = this.retrieveFileMetadataController.bind(this);
    this.retrieveBlobController = this.retrieveBlobController.bind(this);
    this.deleteFileController = this.deleteFileController.bind(this);
  }

  /**
   * Store file data API endpoint, calls the storeBlob service which stores the file data in
   * specified index. Performs error handling if necessary
   */
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

  /**
   * Retrieve file metadata API endpoint, calls the retrieveFileMetadata service.
   * Performs error handling if necessary
   */
  public async retrieveFileMetadataController(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const result = await this.fileServices.retrieveFileMetadata(fileId);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  /**
   * Retrieve file data API endpoint, calls the retrieveBlob service.
   * Performs error handling if necessary
   */
  public async retrieveBlobController(req: Request, res: Response) {
    try {
      const { fileId, blobNumber } = req.params;

      const result = await this.fileServices.retrieveBlob(fileId, Number(blobNumber));

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  /**
   * Create new file metadata API endpoint, calls authenticate service to ensure user is logged in,
   * and then calls the createFileMetadata service. Performs error handling if necessary.
   */
  public async createFileMetadataController(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];
      const { fileName, fileType } = req.body;

      const payload = this.authServices.authenticate(authHeader);
      const result = await this.fileServices.createFileMetadata(payload.id, fileName, fileType);

      res.status(result.code).json(result.body);
    } catch (err) {
      res.status(err.code).json(err.body);
    }
  }

  /**
   * Delete file API endpoint, calls authenticate service to ensure user is logged in,
   * and then calls the deleteFile service. Performs error handling if necessary.
   */
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

  /**
   * Configuration for the express router, defines the HTTP methods and URL for each API endpoints
   */
  public configureRoutes() {
    this.router.post("/:fileId/:blobNumber", this.storeBlobController);
    this.router.get("/:fileId/:blobNumber", this.retrieveBlobController);
    this.router.get("/:fileId", this.retrieveFileMetadataController);
    this.router.post("/", this.createFileMetadataController);
    this.router.delete("/:fileId", this.deleteFileController);
    return this.router;
  }
}
