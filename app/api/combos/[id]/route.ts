import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Combo from "@/models/Combo";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "admin";
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await ctx.params;
  const combo = await Combo.findById(id);
  if (!combo) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(combo);
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await request.json();
  const combo = await Combo.findByIdAndUpdate(id, body, { new: true });
  if (!combo) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(combo);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await Combo.findByIdAndDelete(id);
  return Response.json({ success: true });
}
