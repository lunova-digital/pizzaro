import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await ctx.params;
  const order = await Order.findById(id);

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role: string }).role === "admin";

  if (!isAdmin && order.userId.toString() !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(order);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as { role: string }).role === "admin";
  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await ctx.params;
  const { status } = await request.json();

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(order);
}
