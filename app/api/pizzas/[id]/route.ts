import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Pizza from "@/models/Pizza";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/pizzas/[id]">
) {
  await dbConnect();
  const { id } = await ctx.params;
  const pizza = await Pizza.findById(id);
  if (!pizza) {
    return Response.json({ error: "Pizza not found" }, { status: 404 });
  }
  return Response.json(pizza);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/pizzas/[id]">
) {
  await dbConnect();
  const { id } = await ctx.params;
  const body = await request.json();
  const pizza = await Pizza.findByIdAndUpdate(id, body, { new: true });
  if (!pizza) {
    return Response.json({ error: "Pizza not found" }, { status: 404 });
  }
  return Response.json(pizza);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/pizzas/[id]">
) {
  await dbConnect();
  const { id } = await ctx.params;
  await Pizza.findByIdAndDelete(id);
  return Response.json({ success: true });
}
