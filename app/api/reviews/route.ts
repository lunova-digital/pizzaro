import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const limitParams = url.searchParams.get("limit");
    const pizzaId = url.searchParams.get("pizzaId");

    const query: any = {};
    if (pizzaId) {
      query.pizzaIds = pizzaId;
    }

    let limit = 100;
    if (limitParams) {
      limit = Math.max(1, parseInt(limitParams, 10));
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
