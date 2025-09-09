import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import logger from "../logger/logger.js";

export async function deleteUserImageFolder(email: string) {
  const encodedEmail = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  const folderPath = path.join("uploads", encodedEmail);

  try {
    await fs.rm(folderPath, { recursive: true, force: true });
    logger.info(`[images Delete Service] The user folder for the image has been deleted.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[images Delete Service] Failed to delete user image folder: ${error.message}`);
    } else {
      logger.error(`[images Delete Service] Unknown error occurred while deleting user image folder.`);
    }
  }
};
