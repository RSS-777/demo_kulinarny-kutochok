import { Response } from "express";
import { Subscription } from "../models/Subscription.js";
import logger from "../logger/logger.js";
import { UserRequest } from "../middlewares/userMiddleware.js";

export const subscribeCreate = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {email} = req.body;

    if (!userId) {
      logger.warn(
        `[emailSubscriptionController subscribe] User is not authorized.`
      );
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    if (!email) {
      logger.warn(`[emailSubscriptionController subscribe] Email is missing.`);
      return res
        .status(400)
        .json({ success: false, error: "Email is required." });
    }

    const existing = await Subscription.findOne({ userId });
    if (existing) {
      logger.warn(
        `[emailSubscriptionController subscribe] Already subscribed.`
      );
      return res
        .status(400)
        .json({ success: false, error: "You are already subscribed." });
    }

    await Subscription.create({ userId, email });

    return res.json({ success: true, message: "Subscription successful." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[emailSubscriptionController subscribe] Server error: ${error.message}`
      );
    } else {
      logger.error(
        `[emailSubscriptionController subscribe] Unknown server error`
      );
    }

    return res.status(500).json({
      success: false,
      error: "Server error. Failed to subscribe.",
    });
  }
};

export const subscribeDelete = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      logger.warn(
        `[emailSubscriptionController unsubscribe] User is not authorized.`
      );
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    const result = await Subscription.findOneAndDelete({ userId });

    if (!result) {
      logger.warn(
        `[emailSubscriptionController unsubscribe] Subscription not found.`
      );
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found." });
    }

    return res.json({
      success: true,
      message: "You have successfully unsubscribed.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[emailSubscriptionController unsubscribe] Server error: ${error.message}`
      );
    } else {
      logger.error(
        `[emailSubscriptionController unsubscribe] Unknown server error`
      );
    }

    return res.status(500).json({
      success: false,
      error: "Server error. Failed to unsubscribe.",
    });
  }
};

export const subscribeCheck = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      logger.warn('[emailSubscriptionController check] User is not authorized.');
      return res.status(401).json({ success: false, error: 'User is not authorized.' });
    }

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(200).json({ success: true, subscribed: false });
    }

    return res.status(200).json({ success: true, subscribed: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[emailSubscriptionController check] Server error: ${error.message}`);
    } else {
      logger.error(`[emailSubscriptionController check] Unknown server error`);
    }

    return res.status(500).json({
      success: false,
      error: 'Server error. Failed to check subscription.',
    });
  }
};
