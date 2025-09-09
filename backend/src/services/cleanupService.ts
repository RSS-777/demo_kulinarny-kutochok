import PendingUser from "../models/PendingUser.js";
import ConfirmCode from "../models/ConfirmCode.js";
import BannedEmail from "../models/BanList.js";
import { deleteUserImageFolder } from "./imagesDeleteService.js";
import logger from "../logger/logger.js";

export async function cleanExpiredPendingUsers() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const expiredUsers = await PendingUser.find({
      createdAt: { $lt: fiveMinutesAgo },
    });

    for (const user of expiredUsers) {
      await ConfirmCode.deleteOne({ email: user.email });
      await deleteUserImageFolder(user.email);
      await PendingUser.deleteOne({ _id: user._id });
    }

    if (expiredUsers.length > 0) {
      logger.info(`[CleanupService pending] Deleted ${expiredUsers.length} expired pending users.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`[CleanupService pending] Error during cleaning expired users: ${error.message}`);
    } else {
      logger.error(`[CleanupService pending] Unknown error during cleaning expired users.`);
    }
  }
};

export async function cleanExpiredBannedEmails() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const result = await BannedEmail.deleteMany({ bannedAt: { $lt: thirtyDaysAgo } });
    if (result.deletedCount && result.deletedCount > 0) {
      logger.info(`Deleted ${result.deletedCount} expired banned emails.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`[CleanupService banned] Error during cleaning expired banned emails: ${error.message}`);
    } else {
      logger.error(`[CleanupService banned] Unknown error during cleaning expired banned emails.`);
    }
  }
};
