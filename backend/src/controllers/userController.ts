import { Response } from "express";
import User from "../models/User.js";
import { Favorite } from "../models/Favorite.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import CommentView from "../models/CommentView.js";
import { Subscription } from "../models/Subscription.js";
import { UserRequest } from "../middlewares/userMiddleware.js";
import logger from "../logger/logger.js";
import { deleteUserImageFolder } from "../services/imagesDeleteService.js";

interface IUserResponse {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  gender: "man" | "woman";
  createdAt: Date;
}

export const getUserController = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      logger.warn(`[userController] Not authorized. User ID missing.`);
      return res
        .status(401)
        .json({ error: "Not authorized. User ID missing." });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      logger.warn(`[userController] User not found.`);
      return res.status(404).json({ error: "User not found." });
    }

    const id = (user._id as any).toString();
    const userResponse: IUserResponse = {
      _id: id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      role: user.role,
      gender: user.gender,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      userResponse,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `[deleteUserController] Error getting user: ${error.message}`
      );
    } else {
      logger.error(`[deleteUserController] Error getting user.`);
    }

    res.status(500).json({ error: "Server error while retrieving user." });
  }
};

export const deleteUserController = async (req: UserRequest, res: Response) => {
  try {
    const { email } = req.body;
    const userId = req.userId;
    if (!userId) {
      logger.warn(`[deleteUserController] Not authorized. User ID missing.`);
      return res
        .status(401)
        .json({ error: "Not authorized. User ID missing." });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logger.warn(`[deleteUserController] User not found.`);
      return res.status(404).json({ error: "User not found." });
    }

    await deleteUserImageFolder(email);

    const recipeUser = await Recipe.find({ authorId: userId }, "_id");
    const recipeIds = recipeUser.map((recipe) => recipe._id);

    await Favorite.updateMany(
      { authorIds: userId },
      { $pull: { authorIds: userId } }
    );
    if (recipeIds.length > 0) {
      await Favorite.updateMany(
        { recipeIds: { $in: recipeIds } },
        { $pull: { recipeIds: { $in: recipeIds } } }
      );
    }

    try {
      await Comment.deleteMany({ userId });
      await Comment.updateMany(
        { "answers.userId": userId.toString() },
        { $pull: { answers: { userId: userId.toString() } } }
      );
      await CommentView.deleteOne({ userId });
      await Recipe.deleteMany({ authorId: userId });
      await Favorite.deleteOne({ userId });
      await Subscription.findOneAndDelete({ userId });
    } catch (error) {
      logger.error(`[deleteUserController] Error deleting auxiliary files.`);
    }

    res.status(200).json({ message: "User successfully deleted." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[deleteUserController] Error deleting user: ${error.message}`
      );
    } else {
      logger.error(`[deleteUserController] Unknown error while deleting user.`);
    }

    res.status(500).json({ error: "Server error while deleting user." });
  }
};
