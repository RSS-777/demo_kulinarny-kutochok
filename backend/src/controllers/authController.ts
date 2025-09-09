import { Request, Response } from "express";
import bcrypt from "bcrypt";
import path from "path";
import crypto from "crypto";
import User from "../models/User.js";
import ConfirmCode from "../models/ConfirmCode.js";
import PendingUser from "../models/PendingUser.js";
import BannedEmail from "../models/BanList.js";
import sendEmailConfirmationCode from "../services/mailService.js";
import generateConfirmationCode from "../utils/generateConfirmationCode.js";
import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

interface RegisterBody {
  name: string;
  lastName: string;
  email: string;
  password: string;
  gender: "man" | "woman";
}

interface ConfirmBody {
  email: string;
  code: string;
}

interface RegisterRequest extends Request {
  body: RegisterBody;
  file?: Express.Multer.File;
}

interface ConfirmRequest extends Request {
  body: ConfirmBody;
}

interface LoginBody {
  email: string;
  password: string;
}

interface LoginRequest extends Request {
  body: LoginBody;
}

export const registerRequest = async (req: RegisterRequest, res: Response) => {
  try {
    const { name, lastName, email, password, gender } = req.body;

    const banned = await BannedEmail.findOne({ email: email.trim().toLowerCase() });
    if (banned) {
      logger.warn(`[registerRequest] Email is banned.`);
      return res.status(403).json({ message: "Email is banned." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      logger.warn(`[registerRequest] User already exists.`);
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imagePath: string;

    if (req.file) {
      const encodedEmail = crypto
        .createHash("md5")
        .update(email.trim().toLowerCase())
        .digest("hex");
      imagePath =
        "/" +
        path
          .join("uploads", encodedEmail, req.file.filename)
          .replace(/\\/g, "/");
    } else {
      imagePath =
        gender === "man"
          ? "/uploads/default/man.png"
          : "/uploads/default/women.png";
    }

    await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        lastName,
        gender,
        email,
        password: hashedPassword,
        image: imagePath,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const code = generateConfirmationCode();
    await ConfirmCode.findOneAndUpdate(
      { email },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await sendEmailConfirmationCode(email, code);

    res.status(200).json({ message: "Verification code sent" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[registerRequest] Register error: ${error.message}.`);
    } else {
      logger.error("[registerRequest] Register error.");
    }
    res.status(500).json({ error: "Server error during registration." });
  }
};

export const confirmCode = async (req: ConfirmRequest, res: Response) => {
  try {
    const { email, code } = req.body;

    const codeDoc = await ConfirmCode.findOne({ email });
    if (!codeDoc) {
      logger.warn("[confirmCode] Invalid or expired code.");
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    const CODE_TTL_MS = 5 * 60 * 1000;
    const now = new Date();
    const codeAge = now.getTime() - new Date(codeDoc.createdAt).getTime();

    if (codeAge > CODE_TTL_MS || codeDoc.code !== code) {
      logger.warn("confirmCode Invalid or expired code.");
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      logger.warn("[confirmCode] User data not found.");
      return res.status(404).json({ message: "User data not found." });
    }

    const newUser = new User({
      name: pendingUser.name,
      lastName: pendingUser.lastName,
      email: pendingUser.email,
      password: pendingUser.password,
      gender: pendingUser.gender,
      image: pendingUser.image,
    });

    await newUser.save();

    await ConfirmCode.deleteOne({ email });
    await PendingUser.deleteOne({ email });

    res.status(201).json({ message: "User created successfully." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[confirmController] ${error.message}`);
    } else {
      logger.error("[confirmController] Unknown error occurred.");
    }
    res.status(500).json({ error: "Server error during confirmation." });
  }
};

export const loginUser = async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn(`[loginUser] Please fill all fields.`)
      return res.status(400).json({ message: "Please fill all fields." });
    }

    const banned = await BannedEmail.findOne({ email: email.trim().toLowerCase() });
    if (banned) {
      logger.warn(`[loginUser] Email is banned.`);
      return res.status(403).json({ message: "Email is banned." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`[loginUser] User not found`);
      return res.status(401).json({ message: "Incorrect password or login." });
    }

    const passwordMath = await bcrypt.compare(password, user.password);
    if (!passwordMath) {
      logger.warn(`[loginUser] Invalid password for user`);
      return res.status(401).json({ message: "Incorrect password or login." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ token, userId: user._id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[loginUser] ${error.message}`);
    } else {
      logger.error("[loginUser] Unknown error occurred.");
    }
    res.status(500).json({ error: "Server error. Please try again." });
  }
};
