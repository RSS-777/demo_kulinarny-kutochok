import { Request, Response } from "express";
import BanList, { IBannedEmail } from "../models/BanList.js";
import logger from "../logger/logger.js";

export const addBannedEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      logger.warn("[banListController] Email is required and must be a string.");
      return res.status(400).json({ message: "Email is required and must be a string." });
    }

    const existing = await BanList.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already banned." });
    }

    await BanList.create({ email });

    return res.status(201).json({ message: "Email was banned successfully." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[banListController] Error adding banned email: ${error.message}`);
    } else {
      logger.error("[banListController] Unknown error adding banned email.");
    }
    return res.status(500).json({ error: "Server error." });
  }
};

export const getBannedEmails = async (req: Request, res: Response) => {
  try {
    const emails: IBannedEmail[] = await BanList.find().select("email bannedAt -_id").exec();
    return res.status(200).json({ emails });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[banListController] Error retrieving banned emails: ${error.message}`);
    } else {
      logger.error("[banListController] Unknown error retrieving banned emails.");
    }
    return res.status(500).json({ error: "Server error." });
  }
};

export const removeBannedEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      logger.warn("[banListController] Email is required and must be a string.");
      return res.status(400).json({ message: "Email is required and must be a string." });
    }

    const result = await BanList.deleteOne({ email: email.toLowerCase() });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Email not found in ban list." });
    }

    return res.status(200).json({ message: "Email was removed from ban list." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[banListController] Error removing banned email: ${error.message}`);
    } else {
      logger.error("[banListController] Unknown error removing banned email.");
    }
    
    return res.status(500).json({ error: "Server error." });
  }
};