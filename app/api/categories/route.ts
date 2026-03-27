import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ displayOrder: 1 });
  return Response.json(categories);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const category = await Category.create(body);
  return Response.json(category, { status: 201 });
}
