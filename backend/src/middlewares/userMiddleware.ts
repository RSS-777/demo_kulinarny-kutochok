import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";
import { Request, Response, NextFunction } from "express";

export interface UserRequest extends Request {
  userId?: string;
}

export const userMiddleware = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const userHeader = req.headers.authorization;

  if (!userHeader || !userHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized. Token missing." });
  }

  const token = userHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    req.userId = decoded.id;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`JWT verify error: ${error.message}`);
    } else {
      logger.error(`JWT verify error.`);
    }

    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
