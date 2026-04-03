import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Offer from "@/models/Offer";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const offer = await Offer.findById(id);
  if (!offer) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(offer);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const offer = await Offer.findByIdAndUpdate(id, body, { new: true });
  if (!offer) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(offer);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await Offer.findByIdAndDelete(id);
  return Response.json({ success: true });
}
