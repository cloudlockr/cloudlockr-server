import { Router } from "express";

const router = Router();

router.get("/:fileId", (req, res) => {
  const { fileId } = req.params;
  return res.send("GET /file/" + fileId);
});

router.get("/:fileId/:blobNumber", (req, res) => {
  const { fileId, blobNumber } = req.params;
  res.send(`GET /file/${fileId}/${blobNumber}`);
});

router.post("/", (_, res) => {
  res.send("POST /file");
});

router.post("/:fileId/:blobNumber", (req, res) => {
  const { fileId, blobNumber } = req.params;
  res.send(`POST /file/${fileId}/${blobNumber}`);
});

router.delete("/:fileId", (req, res) => {
  const { fileId } = req.params;
  res.send(`DELETE /file/${fileId}`);
});

export default router;
