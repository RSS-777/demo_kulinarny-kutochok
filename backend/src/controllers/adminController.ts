import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import CommentView from "../models/CommentView.js";
import { IUser } from "../models/User.js";
import { IRecipe } from "../models/Recipe.js";
import { IComment } from "../models/Comment.js";
import { Favorite } from "../models/Favorite.js";
import { Subscription } from "../models/Subscription.js";
import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";
import bcrypt from "bcrypt";
import { deleteUserImageFolder } from "../services/imagesDeleteService.js";
import { deleteRecipePhoto } from "../services/imageDeleteService.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}

const deleteUserAndRelations = async (userId: string, email: string) => {
    try {
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

        await Comment.deleteMany({ userId });
        await Comment.updateMany(
            { "answers.userId": userId.toString() },
            { $pull: { answers: { userId: userId.toString() } } }
        );
        await CommentView.deleteOne({ userId });
        await Recipe.deleteMany({ authorId: userId });
        await Favorite.deleteOne({ userId });
        await Subscription.findOneAndDelete({ userId });

        logger.info(`[deleteUserAndRelations] Successfully deleted relations for userId: ${userId}`);
    } catch (error) {
        logger.error(`[deleteUserAndRelations] Error deleting related data for userId: ${userId} - ${(error as Error).message}`);
    }
}

interface LoginRequestBody {
    email: string;
    password: string;
}

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as LoginRequestBody;

        if (!email || !password) {
            logger.warn(`[loginAdmin] Please fill all fields.`)
            return res.status(400).json({ message: "Please fill all fields." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            logger.warn(`[loginAdmin] User not found`);
            return res.status(401).json({ message: "Incorrect password or login." });
        }

        if (user.role !== "admin") {
            logger.warn(`[loginAdmin] User with email ${email} does not have admin role.`);
            return res.status(403).json({ message: "Access denied. You are not an administrator." });
        }

        const passwordMath = await bcrypt.compare(password, user.password);
        if (!passwordMath) {
            logger.warn(`[loginAdmin] Invalid password for user`);
            return res.status(401).json({ message: "Incorrect password or login." });
        }

        const token = jwt.sign({ id: user._id, isAdmin: true }, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ token, userId: user._id });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[loginAdmin] ${error.message}`);
        } else {
            logger.error("[loginAdmin] Unknown error occurred.");
        }
        res.status(500).json({ error: "Server error. Please try again." });
    }
};

export const getAllUsersForAdmin = async (req: Request, res: Response) => {
    try {
        const users: IUser[] = await User.find().lean();

        res.status(200).json({ users });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[getAllUsersForAdmin] ${error.message}`);
        } else {
            logger.error("[getAllUsersForAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while fetching users." });
    }
};

export const getAllRecipesForAdmin = async (req: Request, res: Response) => {
    try {
        const recipes: IRecipe[] = await Recipe.find().lean();

        res.status(200).json({ recipes });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[getAllRecipesForAdmin] ${error.message}`);
        } else {
            logger.error("[getAllRecipesForAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while fetching recipes." });
    }
};

export const getAllCommentsForAdmin = async (req: Request, res: Response) => {
    try {
        const comments: IComment[] = await Comment.find().lean();

        res.status(200).json({ comments });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[getAllCommentsForAdmin] ${error.message}`);
        } else {
            logger.error("[getAllCommentsForAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while fetching comments." });
    }
};

export const deleteUserByAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn(`[deleteUserByAdmin] Invalid user id: ${id}`);
            return res.status(400).json({ message: "Invalid user id." });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            logger.warn(`[deleteUserByAdmin] User not found with id: ${id}`);
            return res.status(404).json({ message: "User not found." });
        }

        await deleteUserAndRelations(id, deletedUser.email);

        res.status(200).json({ message: "User successfully deleted." });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[deleteUserByAdmin] ${error.message}`);
        } else {
            logger.error("[deleteUserByAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while deleting user." });
    }
};

export const deleteRecipeByAdmin = async (req: Request, res: Response) => {
    try {
        const { id: recipeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            logger.warn(`[deleteRecipeByAdmin] Invalid recipe id: ${recipeId}`);
            return res.status(400).json({ message: "Invalid recipe id." });
        }

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            logger.warn(`[deleteRecipeByAdmin] Recipe not found with id: ${recipeId}`);
            return res.status(404).json({ message: "Recipe not found." });
        }

        if (recipe.photo && recipe.photo !== "/uploads/default/recipeNot.webp") {
            await deleteRecipePhoto(recipe.photo);
        }

        await recipe.deleteOne();

        try {
            await Comment.deleteMany({ recipeId });
            await CommentView.updateMany(
                { "viewedRecipes.recipeId": recipeId },
                { $pull: { viewedRecipes: { recipeId } } }
            );
            await Favorite.updateMany(
                { recipeIds: recipeId },
                { $pull: { recipeIds: recipeId } }
            );
        } catch (error) {
            logger.error(`[deleteRecipeByAdmin] Error deleting related data: ${error}`);
        }

        res.status(200).json({ message: "Recipe successfully deleted." });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[deleteRecipeByAdmin] ${error.message}`);
        } else {
            logger.error("[deleteRecipeByAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while deleting recipe." });
    }
};

export const deleteCommentByAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn(`[deleteCommentByAdmin] Invalid comment id: ${id}`);
            return res.status(400).json({ message: "Invalid comment id." });
        }

        const deletedComment = await Comment.findByIdAndDelete(id);

        if (!deletedComment) {
            logger.warn(`[deleteCommentByAdmin] Comment not found with id: ${id}`);
            return res.status(404).json({ message: "Comment not found." });
        }

        res.status(200).json({ message: "Comment successfully deleted." });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[deleteCommentByAdmin] ${error.message}`);
        } else {
            logger.error("[deleteCommentByAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while deleting comment." });
    }
};

export const deleteAnswerByAdmin = async (req: Request, res: Response) => {
    try {
        const { commentId, answerId } = req.params as { commentId: string, answerId: string };;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            logger.warn(`[deleteAnswerByAdmin] Invalid comment id: ${commentId}`);
            return res.status(400).json({ message: "Invalid comment id." });
        }

        const updated = await Comment.updateOne(
            { _id: commentId },
            { $pull: { answers: { id: answerId } } }
        );

        if (updated.modifiedCount === 0) {
            logger.warn(`[deleteAnswerByAdmin] Answer not found or already deleted with id: ${answerId}`);
            return res.status(404).json({ message: "Answer not found or already deleted." });
        }

        res.status(200).json({ message: "Answer successfully deleted." });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`[deleteAnswerByAdmin] ${error.message}`);
        } else {
            logger.error("[deleteAnswerByAdmin] Unknown error occurred.");
        }
        res.status(500).json({ message: "Server error while deleting answer." });
    }
};