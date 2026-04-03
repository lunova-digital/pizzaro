import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Offer from "@/models/Offer";

export async function GET(request: NextRequest) {
  await dbConnect();
  const now = new Date();
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");

  const query: Record<string, unknown> = {
    isActive: true,
    endsAt: { $gt: now },
    startsAt: { $lte: now },
  };

  if (featured === "true") {
    query.isFeatured = true;
  }

  const offers = await Offer.find(query).sort({ endsAt: 1 });
  return Response.json(offers);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const offer = await Offer.create(body);
  return Response.json(offer, { status: 201 });
}
