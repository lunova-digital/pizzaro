import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role: string }).role === "admin";

  const orders = isAdmin
    ? await Order.find().sort({ createdAt: -1 })
    : await Order.find({ userId }).sort({ createdAt: -1 });

  return Response.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await request.json();
  const userId = (session.user as { id: string }).id;

  const order = await Order.create({ ...body, userId });
  return Response.json(order, { status: 201 });
}
