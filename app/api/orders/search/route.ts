import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const shortId = req.nextUrl.searchParams.get("shortId");
  const phone = req.nextUrl.searchParams.get("phone");
  const email = req.nextUrl.searchParams.get("email");

  if (!shortId || shortId.length < 4) {
    return Response.json({ error: "shortId is required" }, { status: 400 });
  }
  if (!phone && !email) {
    return Response.json({ error: "phone or email required" }, { status: 400 });
  }

  await dbConnect();

  // Match orders where the string representation of _id ends with the given shortId
  const results = await Order.aggregate([
    { $addFields: { idStr: { $toString: "$_id" } } },
    { $match: { idStr: { $regex: shortId.toLowerCase() + "$", $options: "i" } } },
    { $limit: 5 },
  ]);

  if (results.length === 0) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // Find the one that matches the provided contact info
  const order = results.find((o) => {
    const phoneMatch = phone && o.phone === phone;
    const emailMatch = email && o.guestEmail === email.toLowerCase();
    return phoneMatch || emailMatch;
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json({ _id: order._id.toString() });
}
