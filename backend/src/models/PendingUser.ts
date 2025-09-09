import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPendingUser extends Document {
  name: string;
  lastName: string;
  email: string;
  password: string;
  gender: "man" | "woman";
  image: string;
  createdAt?: Date; 
  updatedAt?: Date;
}

const PendingUserSchema: Schema<IPendingUser> = new mongoose.Schema(
  {
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
    gender: { type: String, enum: ["man", "woman"], required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const PendingUser: Model<IPendingUser> =
  mongoose.models.PendingUser ||
  mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);

export default PendingUser;
