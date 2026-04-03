import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  pizzaId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  toppings: string[];
}

export type OrderStatus =
  | "placed"
  | "preparing"
  | "out-for-delivery"
  | "delivered"
  | "ready-for-pickup"
  | "picked-up";

export type DeliveryType = "delivery" | "pickup";

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  items: IOrderItem[];
  deliveryType: DeliveryType;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  addressNotes?: string;
  status: OrderStatus;
  riderPhone?: string;
  riderName?: string;
  rating?: number;
  reviewComment?: string;
  reviewImage?: string;
  totalAmount: number;
  discountAmount?: number;
  offerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  pizzaId: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  toppings: [{ type: String }],
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    guestName: { type: String },
    guestEmail: { type: String },
    items: { type: [OrderItemSchema], required: true },
    deliveryType: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    phone: { type: String, required: true },
    addressNotes: { type: String },
    riderPhone: { type: String },
    riderName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    reviewComment: { type: String },
    reviewImage: { type: String },
    status: {
      type: String,
      enum: [
        "placed",
        "preparing",
        "out-for-delivery",
        "delivered",
        "ready-for-pickup",
        "picked-up",
      ],
      default: "placed",
    },
    totalAmount:    { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    offerId:        { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
