import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(
    (session.user as { id: string }).id
  ).select("phone addresses");
  return Response.json(user || { phone: "", addresses: [] });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { phone, addresses } = await request.json();
  const user = await User.findByIdAndUpdate(
    (session.user as { id: string }).id,
    { phone, addresses },
    { new: true }
  ).select("phone addresses");

  return Response.json(user);
}
