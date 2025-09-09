import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";
import { Request, Response, NextFunction } from "express";

export interface AdminRequest extends Request {
  userId?: string;
}

export const adminMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, isAdmin?: boolean };

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

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