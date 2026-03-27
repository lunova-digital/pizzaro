import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Pizza from "@/models/Pizza";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

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
