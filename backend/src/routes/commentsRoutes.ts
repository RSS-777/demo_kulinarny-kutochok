import express from "express";
import { userMiddleware } from "../middlewares/userMiddleware.js";
import {
  getComments,
  addComment,
  deleteComment,
  addReply,
  deleteAnswer,
  getCommentsCountByAuthor,
  getCommentViewsByUser,
} from "../controllers/commentsController.js";

const router = express.Router();

router.get("/:recipeId", getComments);
router.get("/count-by-author/:authorId", getCommentsCountByAuthor);
router.post("/", userMiddleware, addComment);
router.delete("/:commentId", userMiddleware, deleteComment);
router.delete("/:commentId/answers/:answerId", userMiddleware, deleteAnswer);
router.post("/:commentId/answers", userMiddleware, addReply);
router.get("/views/user/:userId", getCommentViewsByUser);

export default router;
