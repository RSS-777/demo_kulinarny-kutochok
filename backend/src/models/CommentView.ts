import mongoose, { Document, Schema, Model } from "mongoose";

export interface IViewedRecipe {
  recipeId: mongoose.Types.ObjectId;
  lastViewedAt: Date;
}

export interface ICommentView extends Document {
  userId: mongoose.Types.ObjectId;
  viewedRecipes: IViewedRecipe[];  
}

const ViewedRecipeSchema = new Schema<IViewedRecipe>({
  recipeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Recipe" },
  lastViewedAt: { type: Date, required: true, default: Date.now },
}, { _id: false });  

const CommentViewSchema: Schema<ICommentView> = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", unique: true }, 
  viewedRecipes: { type: [ViewedRecipeSchema], default: [] },  
});


const CommentView: Model<ICommentView> =
  mongoose.models.CommentView || mongoose.model<ICommentView>("CommentView", CommentViewSchema);

export default CommentView;