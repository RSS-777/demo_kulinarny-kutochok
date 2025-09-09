import mongoose, { Schema, Document } from 'mongoose'

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId
  recipeIds: mongoose.Types.ObjectId[]
  authorIds: mongoose.Types.ObjectId[]
}

const favoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recipeIds: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  authorIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema)