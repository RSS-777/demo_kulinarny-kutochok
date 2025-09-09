import mongoose, { Document } from "mongoose";
import { Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import Recipe, { IRecipe } from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import CommentView from "../models/CommentView.js";
import { Favorite } from "../models/Favorite.js";
import logger from "../logger/logger.js";
import User, { IUser } from "../models/User.js";
import { deleteRecipePhoto } from "../services/imageDeleteService.js";

interface IRecipeData {
  title: string;
  authorId: mongoose.Types.ObjectId;
  authorPhoto: string;
  ingredients: string;
  instructions: string;
  time: string;
  servings: number;
  category: string;
  photo: string | null;
  authorName: string;
  createdAt: Date;
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const createRecipe = async (req: MulterRequest, res: Response) => {
  try {
    const {
      category,
      ingredients,
      instructions,
      servings,
      time,
      title,
      email,
    } = req.body;

    if (
      !title ||
      !email ||
      !ingredients ||
      !instructions ||
      !time ||
      !servings ||
      !category
    ) {
      logger.warn(
        "[recipeControler] Incorrect data. Please check the information you entered."
      );
      return res.status(400).json({
        message: "Incorrect data. Please check the information you entered.",
      });
    }

    const user = (await User.findOne({ email }).exec()) as IUser | null;
    if (!user) {
      logger.warn(`[recipeController] Failed to add author.`);
      return res.status(404).json({ message: "Failed to add author." });
    }

    let photoPath: string;

    if (req.file) {
      const encodedEmail = crypto
        .createHash("md5")
        .update(email.trim().toLowerCase())
        .digest("hex");
      photoPath =
        "/" +
        path
          .join("uploads", encodedEmail, req.file.filename)
          .replace(/\\/g, "/");
    } else {
      photoPath = `/uploads/default/recipeNot.webp`;
    }

    const newRecipe: IRecipeData = {
      title,
      authorId: user._id,
      authorName: user.name,
      authorPhoto: user.image,
      ingredients,
      instructions,
      time,
      servings: Number(servings),
      category,
      photo: photoPath,
      createdAt: new Date(),
    };

    await Recipe.create(newRecipe);

    return res
      .status(201)
      .json({ message: "The recipe was created successfully." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[recipeControler] Error creating recipe: ${error.message}`);
    } else {
      logger.error(`[recipeControler] Error creating recipe.`);
    }

    return res.status(500).json({ error: "Server error." });
  }
};

interface IRecipeQueryParams {
  authorId?: string | string[];
  recipeId?: string | string[];
  category?: string;
}

interface IResponse {
  success?: boolean;
  message?: string;
  recipes?: IRecipe[];
  error?: string;
}

export const getRecipes = async (
  req: Request<{}, {}, {}, IRecipeQueryParams>,
  res: Response<IResponse>
) => {
  try {
    const { authorId, recipeId, category } = req.query;
    const filter: any = {};

    if (authorId) {
      filter.authorId = Array.isArray(authorId)
        ? { $in: authorId.map((id) => new mongoose.Types.ObjectId(id)) }
        : new mongoose.Types.ObjectId(authorId);
    }

    if (recipeId) {
      filter._id = Array.isArray(recipeId)
        ? { $in: recipeId.map((id) => new mongoose.Types.ObjectId(id)) }
        : new mongoose.Types.ObjectId(recipeId);
    }

    if (category) {
      filter.category = category;
    }

    const recipes = await Recipe.find(filter);

    return res.status(200).json({ recipes });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[recipeController] Error while retrieving recipes: ${error.message}`
      );
    } else {
      logger.error(`[recipeController] Error while retrieving recipes.`);
    }

    return res.status(500).json({ error: "Error while retrieving recipes." });
  }
};

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  userId?: string;
}

export const updateRecipe = async (req: MulterRequest, res: Response) => {
  try {
    const { email, pathOldImage } = req.body;
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      logger.warn(`[updateRecipe controller] Recipe not found.`);
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (recipe.authorId.toString() !== req.userId) {
      logger.warn(
        `[updateRecipe controller] User does not have the right to update.`
      );
      return res
        .status(403)
        .json({ message: "User does not have the right to update." });
    }

    let photoPath: string;

    if (req.file) {
      const encodedEmail = crypto
        .createHash("md5")
        .update(email.trim().toLowerCase())
        .digest("hex");

      photoPath =
        "/" +
        path
          .join("uploads", encodedEmail, req.file.filename)
          .replace(/\\/g, "/");

      if (pathOldImage && pathOldImage !== "/uploads/default/recipeNot.webp") {
        try {
          await deleteRecipePhoto(pathOldImage);
        } catch (err) {
          logger.error(
            `[image Delete Service] Failed to delete recipe photo: ${err}`
          );
        }
      }
    } else {
      photoPath = recipe.photo || "/uploads/default/recipeNot.webp";
    }

    const updatedFields: Partial<IRecipe> = {
      title: req.body.title,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      time: req.body.time,
      servings: req.body.servings,
      category: req.body.category,
      photo: photoPath,
    };

    await Recipe.findByIdAndUpdate(recipeId, updatedFields, { new: true });

    res.status(200).json({ message: "Recipe updated successfully." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[updateRecipe controller] Recipe not updated, server error: ${error.message}`
      );
    } else {
      logger.error(
        `[updateRecipe controller] Recipe not updated, server error.`
      );
    }
    res.status(500).json({ error: "Recipe not updated, server error." });
  }
};

interface IDeleteRequest extends Request {
  userId?: string;
}

export const deleteRecipe = async (req: IDeleteRequest, res: Response) => {
  try {
    const recipeId = req.params.id;
    const userId = req.userId;

    if (!userId) {
      logger.warn(
        `[recipeController delete] Unauthorized: missing or invalid token.`
      );
      return res
        .status(401)
        .json({ error: "Unauthorized: missing or invalid token." });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      logger.warn(`[recipeController delete] Recipe not found.`);
      return res.status(404).json({ error: "Recipe not found." });
    }

    if (recipe.authorId.toString() !== userId) {
      logger.warn(
        `[recipeController delete] Forbidden: you don't have permission to delete this recipe.`
      );
      return res.status(403).json({
        error: "Forbidden: you don't have permission to delete this recipe.",
      });
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
      logger.error(`[recipeController deleteRecipe] Related files are not deleted: ${error}`)
    }

    res.status(200).json({ message: "Recipe deleted successfully." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[recipeController delete] Error deleting recipe: ${error.message}`
      );
    } else {
      logger.error(
        `[recipeController delete] Unknown error while deleting recipe.`
      );
    }
    res.status(500).json({ error: "Server error while deleting recipe." });
  }
};
