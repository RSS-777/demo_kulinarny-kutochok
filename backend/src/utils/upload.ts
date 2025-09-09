import multer from "multer";
import path from "path";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";
import logger from "../logger/logger.js";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExtensions = [".jpeg", ".jpg", ".png", ".webp"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Дозволено лише файли: jpg, jpeg, png, webp");
    logger.error("Multer file filter error: ", error);
    cb(error);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});