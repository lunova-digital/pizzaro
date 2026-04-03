import mongoose, { Schema, Document } from 'mongoose';

export interface IRider extends Document {
	name: string;
	phone: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const RiderSchema = new Schema<IRider>(
	{
		name: { type: String, required: true },
		phone: { type: String, required: true, unique: true },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default mongoose.models.Rider ||
	mongoose.model<IRider>('Rider', RiderSchema);
