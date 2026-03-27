import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  image: string;
  displayOrder: number;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  displayOrder: { type: Number, default: 0 },
});

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
