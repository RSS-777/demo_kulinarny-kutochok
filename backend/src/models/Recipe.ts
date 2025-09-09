import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorPhoto: string;
  ingredients: string;
  instructions: string;
  time: string;
  servings: number;
  category: string;
  photo: string;
  createdAt: Date;
  lastCommentAt?: Date;
}

const RecipeSchema: Schema<IRecipe> = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  authorName: { type: String, required: true },
  authorPhoto: { type: String, require: true },
  ingredients: { type: String, required: true },
  instructions: { type: String, required: true },
  time: { type: String, required: true },
  servings: { type: Number, required: true },
  category: { type: String, required: true, trim: true },
  photo: {
    type: String,
    required: true,
    default: "/uploads/default/recipeNot.png",
  },
  createdAt: { type: Date, required: true, default: () => new Date() },
  lastCommentAt: { type: Date, default: null },
});

const Recipe: Model<IRecipe> =
  mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);

export default Recipe;
