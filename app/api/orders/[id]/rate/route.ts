import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Pizza from "@/models/Pizza";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const rating = Number(body.rating);

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const completedStatuses = ["delivered", "picked-up"];
  if (!completedStatuses.includes(order.status)) {
    return NextResponse.json(
      { error: "Order must be delivered before rating" },
      { status: 400 }
    );
  }

  if (order.rating) {
    return NextResponse.json({ error: "Already rated" }, { status: 400 });
  }

  order.rating = rating;
  await order.save();

  // Update averageRating on each unique pizza in the order
  const pizzaIds = [...new Set(order.items.map((i: { pizzaId: string }) => i.pizzaId))];
  for (const pizzaId of pizzaIds) {
    const pizza = await Pizza.findById(pizzaId);
    if (!pizza) continue;
    const newCount = pizza.ratingCount + 1;
    const newAvg =
      (pizza.averageRating * pizza.ratingCount + rating) / newCount;
    pizza.ratingCount = newCount;
    pizza.averageRating = Math.round(newAvg * 10) / 10;
    await pizza.save();
  }

  return NextResponse.json({ success: true, rating });
}
