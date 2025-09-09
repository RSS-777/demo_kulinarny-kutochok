import mongoose, { Document, Schema } from "mongoose";

interface IConfirmCode extends Document {
  email: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConfirmCodeSchema = new Schema<IConfirmCode>({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
}, { timestamps: true });

const ConfirmCode = mongoose.model<IConfirmCode>("ConfirmCode", ConfirmCodeSchema);
export default ConfirmCode;