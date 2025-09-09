import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema<ISubscription> = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema)

