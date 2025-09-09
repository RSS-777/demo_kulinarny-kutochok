import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import logger from "../logger/logger.js";

interface CustomRequest extends Request {
  body: {
    email?: string;
  };
  file?: Express.Multer.File;
}

export async function compressingImage(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) return next();

    const rawEmail = req.body.email?.trim().toLowerCase();
    const encodedEmail = rawEmail
      ? crypto.createHash("md5").update(rawEmail).digest("hex")
      : "common";

    const uploadDir = path.join("uploads", encodedEmail);
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const compressedFilename = `${uniqueSuffix}.webp`;
    const compressedPath = path.join(uploadDir, compressedFilename);

    await sharp(req.file.buffer)
      .webp({ quality: 75 })
      .toFile(compressedPath);

    req.file.filename = compressedFilename;
    req.file.path = compressedPath;

    next();
  } catch (error) {
    logger.error(`[compressingImage] Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    next(error);
  }
};