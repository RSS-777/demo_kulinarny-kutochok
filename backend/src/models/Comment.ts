import mongoose, { Document, Schema, Model } from "mongoose"

export interface IAnswer {
  id: string
  userId: string
  userName: string
  date: string
  text: string
  answerToUserId: string
}

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId
  userName: string
  date: string
  text: string
  recipeId: mongoose.Types.ObjectId
  answers: IAnswer[]
}

const AnswerSchema = new Schema<IAnswer>(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    date: { type: String, required: true },
    text: { type: String, required: true },
    answerToUserId: { type: String, required: true },
  },
  { _id: false }
)

const CommentSchema: Schema<IComment> = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Recipe" },
  answers: { type: [AnswerSchema], default: [] },
})

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)

export default Comment