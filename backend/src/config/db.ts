import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import logger from "../logger/logger.js";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      logger.error("MONGO_URL is not defined");
      throw new Error("MONGO_URL is not defined");
    }
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("MongoDB connected successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection error: ${error.message}`);
    } else {
      logger.error(`MongoDB connection error.`);
    }
    process.exit(1);
  }
};

export default connectDB;
