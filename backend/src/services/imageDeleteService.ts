import fs from "fs/promises";
import path from "path";
import logger from "../logger/logger.js";

export async function deleteRecipePhoto(photoPath: string) {
  try {
    const normalizedPath = photoPath.startsWith("/")
      ? photoPath.slice(1)
      : photoPath;
    const fullPath = path.join(process.cwd(), normalizedPath);

    await fs.unlink(fullPath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[image Delete Service] Failed to delete recipe photo: ${error.message}`);
    } else {
      logger.error(`[image Delete Service] Unknown error while deleting recipe photo.`);
    }
  }
};
