import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Pizza from "@/models/Pizza";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const all = searchParams.get("all");

  // Admin requesting all pizzas (including unavailable)
  if (all === "true") {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === "admin";
    if (isAdmin) {
      const pizzas = await Pizza.find({}).sort({ createdAt: -1 });
      return Response.json(pizzas);
    }
  }

  const filter: Record<string, unknown> = { isAvailable: true };
  if (category && category !== "All") {
    filter.category = category;
  }

  const pizzas = await Pizza.find(filter).sort({ name: 1 });
  return Response.json(pizzas);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const pizza = await Pizza.create(body);
  return Response.json(pizza, { status: 201 });
}
