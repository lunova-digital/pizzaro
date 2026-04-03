import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  guestName?: string;
  rating: number;
  comment?: string;
  image?: string;
  pizzaIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    guestName: { type: String, default: "Anonymous" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    image: { type: String },
    pizzaIds: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
