import { Request, Response } from "express";
import Comment, { IAnswer, IComment } from "../models/Comment.js";
import CommentView, { ICommentView } from "../models/CommentView.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import { IUser } from "../models/User.js";
import logger from "../logger/logger.js";
import mongoose from "mongoose";

const updateCommentViewIfAuthor = async (userId: string, recipeId: string) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(recipeId)
  )
    return;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) return;

  if (recipe.authorId.toString() !== userId) return;

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const recipeObjectId = new mongoose.Types.ObjectId(recipeId);

  await CommentView.findOneAndUpdate(
    { userId: userObjectId },
    {
      $pull: {
        viewedRecipes: { recipeId: recipeObjectId },
      },
    },
    { upsert: true }
  );

  await CommentView.findOneAndUpdate(
    { userId: userObjectId },
    {
      $push: {
        viewedRecipes: {
          recipeId: recipeObjectId,
          lastViewedAt: new Date(),
        },
      },
    },
    { upsert: true }
  );
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { recipeId } = req.params;

    if (!recipeId) {
      logger.warn(`[commentsController get] Missing recipeId parameter.`);
      return res.status(400).json({ error: "Missing recipeId parameter." });
    }

    const userId = req.query.userId as string | undefined;

    if (userId) {
      await updateCommentViewIfAuthor(userId, recipeId);
    }

    const comments = await Comment.find({ recipeId }).sort({ date: -1 }).exec();

    return res.status(200).json({ comments });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[commentsController get] Error getting comments: ${error}`);
    } else {
      logger.error(`[commentsController get] Error getting comments.`);
    }
    return res.status(500).json({ message: "Error getting comments." });
  }
};

interface IRequestAddComment extends Request {
  userId?: string;
}

export const addComment = async (req: IRequestAddComment, res: Response) => {
  try {
    const { recipeId, text } = req.body;
    const userId = req.userId;

    const user: IUser | null = await User.findById(userId).exec();

    if (!user) {
      logger.warn(`[commentsController add] User not found.`);
      return res.status(404).json({ message: "User not found." });
    }

    if (!recipeId || !text) {
      logger.warn(
        `[commentsController add] Incorrect data for adding a comment.`
      );
      return res
        .status(400)
        .json({ message: "Incorrect data for adding a comment." });
    }

    const newComment: IComment = await Comment.create({
      recipeId,
      text,
      userId: user._id,
      userName: user.name,
      date: new Date().toISOString().slice(0, 10),
      answers: [],
    });

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      logger.warn(`[commentsController add] Recipe not found.`);
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (user._id.toString() !== recipe.authorId.toString()) {
      await Recipe.findByIdAndUpdate(recipeId, {
        $set: { lastCommentAt: new Date() },
      });
    }

    return res.status(201).json({ comment: newComment });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[commentsController] Error adding comment: ${error}`);
    } else {
      logger.error(`[commentsController] Error adding comment.`);
    }
    return res
      .status(500)
      .json({ message: "Server error while adding comment." });
  }
};

export const deleteComment = async (req: IRequestAddComment, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      logger.error(`[commentsController delete] Invalid comment ID.`);
      return res.status(400).json({ message: "Invalid comment ID." });
    }

    const user: IUser | null = await User.findById(userId).exec();

    if (!user) {
      logger.warn(`[commentsController delete] User not found.`);
      return res.status(404).json({ message: "User not found." });
    }

    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
      logger.warn(`[commentsController delete] Comment not found.`);
      return res.status(404).json({ message: "Comment not found." });
    }

    if (!comment.userId.equals(user._id) && user.role !== "admin") {
      logger.warn(
        `[commentsController delete] Insufficient permissions to delete..`
      );
      return res
        .status(401)
        .json({ message: "Insufficient permissions to delete." });
    }

    await Comment.deleteOne({ _id: commentId });
    return res.status(200).json({ message: "Comment deleted." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[commentsController delete] Error deleting comment: ${error}`
      );
    } else {
      logger.error(`[commentsController delete] Error deleting comment.`);
    }
    return res
      .status(500)
      .json({ message: "Помилка сервера при видаленні коментаря." });
  }
};

export const deleteAnswer = async (req: IRequestAddComment, res: Response) => {
  try {
    const { commentId, answerId } = req.params;
    const userId = req.userId;

    if (!userId) {
      logger.warn(
        `[commentsController deleteAnswer] Unauthorized access. No userId.`
      );
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!commentId || !answerId) {
      logger.warn(
        `[commentsController deleteAnswer] Missing commentId or answerId.`
      );
      return res.status(400).json({ message: "Missing parameters." });
    }

    const comment = await Comment.findById(commentId).exec();
    if (!comment) {
      logger.warn(`[commentsController deleteAnswer] Comment not found.`);
      return res.status(404).json({ message: "Comment not found." });
    }

    const answerIndex = comment.answers.findIndex((ans) => ans.id === answerId);
    if (answerIndex === -1) {
      logger.warn(
        `[commentsController deleteAnswer] Answer not found: ${answerId} in comment ${commentId}`
      );
      return res.status(404).json({ message: "Answer not found." });
    }

    const answer = comment.answers[answerIndex];
    const user = await User.findById(userId).exec();

    if (!user) {
      logger.warn(`[commentsController deleteAnswer] User not found.`);
      return res.status(404).json({ message: "User not found." });
    }

    if (answer.userId !== userId && user.role !== "admin") {
      logger.warn(
        `[commentsController deleteAnswer] Access denied for user to delete answer.`
      );
      return res.status(403).json({ message: "Access denied." });
    }

    comment.answers.splice(answerIndex, 1);
    await comment.save();

    return res.status(200).json({ message: "Answer deleted." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[commentsController deleteAnswer] Error delete answer: ${error}`
      );
    } else {
      logger.error(`[commentsController deleteAnswer] Error delete answer.`);
    }
    return res
      .status(500)
      .json({ message: "Server error while deleting answer." });
  }
};

export const addReply = async (req: IRequestAddComment, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!commentId || !text) {
      logger.warn(`[commentsController addReply] Missing commentId or text.`);
      return res.status(400).json({ message: "Missing commentId or text." });
    }

    if (!userId) {
      logger.warn(`[commentsController addReply] Unauthorized access.`);
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      logger.warn(`[commentsController addReply] User not found.`);
      return res.status(404).json({ message: "User not found." });
    }

    const comment = await Comment.findById(commentId).exec();
    if (!comment) {
      logger.warn(`[commentsController addReply] Comment not found.`);
      return res.status(404).json({ message: "Comment not found." });
    }

    const newAnswer: IAnswer = {
      id: `a${comment.answers.length + 1}`,
      userId: user._id.toString(),
      userName: user.name,
      date: new Date().toISOString().slice(0, 10),
      text,
      answerToUserId: comment.userId.toString(),
    };

    comment.answers.push(newAnswer);
    await comment.save();

    const recipe = await Recipe.findById(comment.recipeId);
    if (!recipe) {
      logger.warn(`[commentsController addReply] Recipe not found.`);
      return res.status(404).json({ message: "Recipe not found." });
    }

    if (recipe && user._id.toString() !== recipe.authorId.toString()) {
      await Recipe.findByIdAndUpdate(comment.recipeId, {
        $set: { lastCommentAt: new Date() },
      });
    }

    return res.status(201).json({ answer: newAnswer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[commentsController addReply] Error adding reply: ${error}`
      );
    } else {
      logger.error(`[commentsController addReply] Error adding reply.`);
    }
    return res.status(500).json({ error: "Server error while adding reply." });
  }
};

interface ICommentsCountByRecipe {
  [recipeId: string]: number;
}

export const getCommentsCountByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;

    if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
      logger.warn(
        `[commentsController getCommentsCountByAuthor] Invalid or missing authorId.`
      );
      return res.status(400).json({ error: "Invalid or missing authorId." });
    }

    const recipes = await Recipe.find({ authorId }).select("_id").exec();
    if (!recipes.length) {
      return res.status(200).json({ commentsCountByRecipe: {} });
    }

    const recipeIds = recipes.map((r) => r._id);

    const counts = await Comment.aggregate([
      { $match: { recipeId: { $in: recipeIds } } },
      {
        $group: {
          _id: "$recipeId",
          commentsCount: { $sum: 1 },
          answersCount: { $sum: { $size: { $ifNull: ["$answers", []] } } },
        },
      },
      {
        $addFields: {
          totalCount: { $add: ["$commentsCount", "$answersCount"] },
        },
      },
    ]);

    const commentsCountByRecipe: ICommentsCountByRecipe = {};
    counts.forEach(({ _id, totalCount }) => {
      commentsCountByRecipe[_id.toString()] = totalCount;
    });

    return res.status(200).json({ commentsCountByRecipe });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `[commentsController getCommentsCountByAuthor] Error: ${error.message}`
      );
    } else {
      logger.error(
        `[commentsController getCommentsCountByAuthor] Unknown error.`
      );
    }
    return res
      .status(500)
      .json({ error: "Server error while counting comments." });
  }
};

export const getCommentViewsByUser = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`[getCommentViewsByUser] Invalid or missing userId.`);
      return res
        .status(400)
        .json({ error: "Invalid or missing userId parameter." });
    }

    const commentView = await CommentView.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean<ICommentView | null>();

    if (!commentView) {
      return res.status(200).json({ viewedRecipes: [] });
    }

    return res.status(200).json({ viewedRecipes: commentView.viewedRecipes });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `[getCommentViewsByUser] Error fetching comment views: ${error}`
      );
    } else {
      logger.error(`[getCommentViewsByUser] Error fetching comment views.`);
    }
    return res.status(500).json({ error: "Internal server error." });
  }
};
