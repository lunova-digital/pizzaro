import mongoose, { Schema, Document } from "mongoose";

export interface ICombo extends Document {
  name: string;
  name_bn: string;
  description: string;
  description_bn: string;
  items: string[];
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  offerEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComboSchema = new Schema<ICombo>(
  {
    name:           { type: String, required: true },
    name_bn:        { type: String, default: "" },
    description:    { type: String, required: true },
    description_bn: { type: String, default: "" },
    items:          [{ type: String }],
    price:          { type: Number, required: true },
    image:          { type: String, required: true },
    isAvailable:    { type: Boolean, default: true },
    isFeatured:     { type: Boolean, default: false },
    offerEndsAt:    { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Combo ||
  mongoose.model<ICombo>("Combo", ComboSchema);
