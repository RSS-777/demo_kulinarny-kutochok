import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  lastName: string;
  email: string;
  password: string;
  image: string;
  role: "user" | "admin";
  gender: "man" | "woman";
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  image: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  gender: { type: String, enum: ["man", "woman"], default: "man" },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
