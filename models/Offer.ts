import mongoose, { Schema, Document } from "mongoose";

export type OfferType = "percentage" | "flat" | "combo";
export type TargetType = "all" | "category" | "pizza";

export interface IOffer extends Document {
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  type: OfferType;
  discountValue: number;
  targetType: TargetType;
  targetId?: string;
  minOrderValue?: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  isFeatured: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title:          { type: String, required: true },
    title_bn:       { type: String, default: "" },
    description:    { type: String, default: "" },
    description_bn: { type: String, default: "" },
    type:           { type: String, enum: ["percentage", "flat", "combo"], required: true },
    discountValue:  { type: Number, required: true, min: 0 },
    targetType:     { type: String, enum: ["all", "category", "pizza"], default: "all" },
    targetId:       { type: String },
    minOrderValue:  { type: Number, default: 0 },
    startsAt:       { type: Date, required: true },
    endsAt:         { type: Date, required: true },
    isActive:       { type: Boolean, default: true },
    isFeatured:     { type: Boolean, default: false },
    image:          { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Offer ||
  mongoose.model<IOffer>("Offer", OfferSchema);
