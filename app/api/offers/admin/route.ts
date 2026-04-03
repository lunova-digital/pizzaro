import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Offer from "@/models/Offer";

// Admin-only endpoint that returns ALL offers regardless of expiry/active state
export async function GET() {
  await dbConnect();
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const offers = await Offer.find({}).sort({ createdAt: -1 });
  return Response.json(offers);
}
