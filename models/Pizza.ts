import mongoose, { Schema, Document } from "mongoose";

export interface ISize {
  name: string;
  price: number;
}

export interface IPizza extends Document {
  name: string;
  name_bn: string;
  description: string;
  description_bn: string;
  image: string;
  category: string;
  sizes: ISize[];
  toppings: string[];
  isAvailable: boolean;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new Schema<ISize>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const PizzaSchema = new Schema<IPizza>(
  {
    name:           { type: String, required: true },
    name_bn:        { type: String, default: "" },
    description:    { type: String, required: true },
    description_bn: { type: String, default: "" },
    image:          { type: String, required: true },
    category:       { type: String, required: true },
    sizes:          { type: [SizeSchema], required: true },
    toppings:       [{ type: String }],
    isAvailable:    { type: Boolean, default: true },
    averageRating:  { type: Number, default: 5 },
    ratingCount:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Pizza ||
  mongoose.model<IPizza>("Pizza", PizzaSchema);
