import express from "express";
import {
  addBannedEmail,
  getBannedEmails,
  removeBannedEmail
} from "../controllers/bannedController.js";

import { adminMiddleware } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/", adminMiddleware, addBannedEmail);
router.get("/", adminMiddleware, getBannedEmails);
router.delete("/", adminMiddleware, removeBannedEmail);

export default router;