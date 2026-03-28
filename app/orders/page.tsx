"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, ChevronRight, Download } from "lucide-react";

interface Order {
  _id: string;
  items: { name: string; quantity: number; size: string }[];
  deliveryType: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  preparing: "bg-yellow-100 text-yellow-700",
  "out-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  "ready-for-pickup": "bg-purple-100 text-purple-700",
  "picked-up": "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  placed: "Order Placed",
  preparing: "Preparing",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  "ready-for-pickup": "Ready for Pickup",
  "picked-up": "Picked Up",
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (loading && status !== "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-dark mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">
              Your order history will appear here
            </p>
            <Link
              href="/menu"
              className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/orders/${order._id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {order.deliveryType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {order.items
                        .map((i) => `${i.quantity}x ${i.name}`)
                        .join(", ")}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-bold text-dark">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/orders/${order._id}?download=1`}
                      title="Download Invoice"
                      className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-orange-50 transition-all"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                    <Link href={`/orders/${order._id}`}>
                      <ChevronRight className="h-5 w-5 text-gray-300 hover:text-primary transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
