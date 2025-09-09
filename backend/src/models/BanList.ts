import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBannedEmail extends Document {
  email: string;
  bannedAt: Date;
}

const BannedEmailSchema: Schema<IBannedEmail> = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  bannedAt: { type: Date, default: Date.now },
});

const BannedEmail: Model<IBannedEmail> =
  mongoose.models.BannedEmail || mongoose.model<IBannedEmail>("BannedEmail", BannedEmailSchema);

export default BannedEmail;
