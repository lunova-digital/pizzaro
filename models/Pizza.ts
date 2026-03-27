import mongoose, { Schema, Document } from "mongoose";

export interface ISize {
  name: string;
  price: number;
}

export interface IPizza extends Document {
  name: string;
  description: string;
  image: string;
  category: string;
  sizes: ISize[];
  toppings: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new Schema<ISize>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const PizzaSchema = new Schema<IPizza>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    sizes: { type: [SizeSchema], required: true },
    toppings: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Pizza ||
  mongoose.model<IPizza>("Pizza", PizzaSchema);
