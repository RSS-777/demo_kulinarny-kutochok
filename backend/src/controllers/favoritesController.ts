import mongoose, { Document } from "mongoose";
import { Request, Response } from "express";
import logger from "../logger/logger.js";
import { UserRequest } from "../middlewares/userMiddleware.js";
import { Favorite } from "../models/Favorite.js";
import User from "../models/User.js";

export const addFavoriteRecipe = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { recipeId } = req.body;

    if (!recipeId) {
      logger.warn(`[favoriteController add] Not specified recipeId.`);
      return res
        .status(400)
        .json({ success: false, error: "Not specified recipeId." });
    }

    if (!userId) {
      logger.warn(`[favoriteController add] User is not authorized.`);
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = new Favorite({ userId, recipeIds: [recipeId] });
    } else {
      const alreadyExists = favorite.recipeIds.some(
        (id) => id.toString() === recipeId
      );

      if (!alreadyExists) {
        favorite.recipeIds.push(recipeId);
      }
    }

    await favorite.save();

    return res.json({ success: true, message: "Recipe added to favorites." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[favoriteController add] Server error. Failed to add recipe: ${error.message}`
      );
    } else {
      logger.error(
        "[favoriteController add] Server error. Failed to add recipe."
      );
    }

    return res.status(500).json({
      success: false,
      error: "Server error. Failed to add recipe.",
    });
  }
};

export const getFavorites = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      logger.warn(`[favoriteController getFavorites] User is not authorized.`);
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    const favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      return res.json({
        success: true,
        data: { recipeIds: [], authorIds: [] },
      });
    }

    return res.json({
      success: true,
      data: {
        recipeIds: favorite.recipeIds,
        authorIds: favorite.authorIds,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[favoriteController getFavorites] Server error: ${error.message}`
      );
    } else {
      logger.error("[favoriteController getFavorites] Server error.");
    }
    return res.status(500).json({
      success: false,
      error: "Server error. Failed to get favorites.",
    });
  }
};

export const deleteFavoriteRecipe = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;
    const recipeId = req.params.recipeId;

    if (!userId) {
      logger.warn(`[favoriteController delete] User is not authorized.`);
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    if (!recipeId) {
      logger.warn(`[favoriteController delete] recipeId is not specified.`);
      return res
        .status(400)
        .json({ success: false, error: "recipeId is not specified." });
    }

    const favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      return res.json({
        success: true,
        message: "No favorites found for user.",
      });
    }

    const initialLength = favorite.recipeIds.length;
    favorite.recipeIds = favorite.recipeIds.filter(
      (id) => id.toString() !== recipeId
    );

    if (favorite.recipeIds.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, error: "Recipe not found in favorites." });
    }

    await favorite.save();

    return res.json({
      success: true,
      message: "Recipe removed from favorites.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[favoriteController delete] Server error: ${error.message}`
      );
    } else {
      logger.error("[favoriteController delete] Server error.");
    }
    return res.status(500).json({
      success: false,
      error: "Server error. Failed to delete recipe from favorites.",
    });
  }
};

export const addFavoriteAuthor = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { authorId } = req.body;

    if (!authorId) {
      logger.warn(`[favoriteController addAuthor] Not specified authorId.`);
      return res
        .status(400)
        .json({ success: false, error: "Not specified authorId." });
    }

    if (!userId) {
      logger.warn(`[favoriteController addAuthor] User is not authorized.`);
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = new Favorite({ userId, authorIds: [authorId] });
    } else {
      const alreadyExists = favorite.authorIds.some(
        (id) => id.toString() === authorId
      );

      if (!alreadyExists) {
        favorite.authorIds.push(authorId);
      }
    }

    await favorite.save();

    return res.json({ success: true, message: "Author added to favorites." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[favoriteController addAuthor] Server error. Failed to add author: ${error.message}`
      );
    } else {
      logger.error(
        "[favoriteController addAuthor] Server error. Failed to add author."
      );
    }

    return res.status(500).json({
      success: false,
      error: "Server error. Failed to add author.",
    });
  }
};

export const deleteFavoriteAuthor = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.userId;
    const authorId = req.params.authorId;

    if (!userId) {
      logger.warn(`[favoriteController deleteAuthor] User is not authorized.`);
      return res
        .status(401)
        .json({ success: false, error: "User is not authorized." });
    }

    if (!authorId) {
      logger.warn(
        `[favoriteController deleteAuthor] authorId is not specified.`
      );
      return res
        .status(400)
        .json({ success: false, error: "authorId is not specified." });
    }

    const favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      return res.json({
        success: true,
        message: "No favorites found for user.",
      });
    }

    const initialLength = favorite.authorIds.length;
    favorite.authorIds = favorite.authorIds.filter(
      (id) => id.toString() !== authorId
    );

    if (favorite.authorIds.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, error: "Author not found in favorites." });
    }

    await favorite.save();

    return res.json({
      success: true,
      message: "Author removed from favorites.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[favoriteController deleteAuthor] Server error: ${error.message}`
      );
    } else {
      logger.error("[favoriteController deleteAuthor] Server error.");
    }
    return res.status(500).json({
      success: false,
      error: "Server error. Failed to delete author from favorites.",
    });
  }
};

export const getPublicAuthors = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      logger.warn("[userController getPublicAuthors] No valid ids provided.");
      return res.status(400).json({
        success: false,
        error: "The author list is empty or in the wrong format.",
      });
    }

    const users = await User.find({ _id: { $in: ids } }, "_id name image");

    const authors = users.map((user) => ({
      id: user._id,
      name: user.name,
      image: user.image || "",
    }));

    return res.json({ success: true, authors });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[userController getPublicAuthors] Server error: ${error.message}`
      );
    } else {
      logger.error("[userController getPublicAuthors] Unknown server error");
    }

    return res.status(500).json({
      success: false,
      error: "Server error. Failed to retrieve authors.",
    });
  }
};
