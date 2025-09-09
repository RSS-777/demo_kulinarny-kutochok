import express from "express";
import { userMiddleware } from "../middlewares/userMiddleware.js";
import {
  addFavoriteRecipe,
  addFavoriteAuthor,
  deleteFavoriteRecipe,
  deleteFavoriteAuthor,
  getFavorites,
  getPublicAuthors
} from "../controllers/favoritesController.js";

const router = express.Router();

router.post("/addRecipe", userMiddleware, addFavoriteRecipe);
router.post("/addAuthor", userMiddleware, addFavoriteAuthor);
router.get("/getFavorites", userMiddleware, getFavorites);
router.delete("/deleteRecipe/:recipeId", userMiddleware, deleteFavoriteRecipe);
router.delete("/deleteAuthor/:authorId", userMiddleware, deleteFavoriteAuthor);
router.post("/publicAuthors", userMiddleware, getPublicAuthors);

export default router;
