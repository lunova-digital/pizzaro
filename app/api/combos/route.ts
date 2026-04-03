import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Combo from "@/models/Combo";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");
  const featured = searchParams.get("featured");

  if (all === "true") {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === "admin";
    if (isAdmin) {
      const combos = await Combo.find({}).sort({ createdAt: -1 });
      return Response.json(combos);
    }
  }

  const query: Record<string, unknown> = { isAvailable: true };
  if (featured === "true") query.isFeatured = true;

  const combos = await Combo.find(query).sort({ createdAt: 1 });
  return Response.json(combos);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const combo = await Combo.create(body);
  return Response.json(combo, { status: 201 });
}
