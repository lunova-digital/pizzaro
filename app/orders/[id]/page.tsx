"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Clock, ChefHat, Truck, Package, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Order {
  _id: string;
  items: { name: string; size: string; quantity: number; price: number; toppings: string[] }[];
  deliveryType: string;
  address?: { street: string; city: string; state: string; zipCode: string };
  phone: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const deliverySteps = [
  { key: "placed", label: "Order Placed", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "out-for-delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const pickupSteps = [
  { key: "placed", label: "Order Placed", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready-for-pickup", label: "Ready for Pickup", icon: Package },
  { key: "picked-up", label: "Picked Up", icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setOrder(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
    // Poll every 30s for status updates
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const steps = order.deliveryType === "pickup" ? pickupSteps : deliverySteps;
  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-dark mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          My Orders
        </Link>

        {/* Success banner for new orders */}
        {isNew && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-accent/10 border border-accent/20 rounded-2xl p-4 text-center"
          >
            <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
            <h2 className="font-bold text-dark">Order Placed Successfully!</h2>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;ve received your order and are getting started on it.
            </p>
          </motion.div>
        )}

        {/* Status tracker */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-dark">Order Status</h2>
            <span className="text-xs text-gray-400">
              Updates every 30s
            </span>
          </div>

          <div className="relative mt-6">
            {/* Progress bar */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 mx-8">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            <div className="relative flex justify-between">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentStepIndex;
                const current = i === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 w-1/4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                        done
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "bg-gray-100 text-gray-300"
                      } ${current ? "ring-4 ring-primary/20 scale-110" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-medium text-center leading-tight ${
                        done ? "text-dark" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-dark mb-4">Order Details</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-dark">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-400 ml-1">({item.size})</span>
                  {item.toppings.length > 0 && (
                    <p className="text-xs text-gray-400">
                      + {item.toppings.join(", ")}
                    </p>
                  )}
                </div>
                <span className="font-medium text-dark">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold text-dark">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-dark mb-3">
            {order.deliveryType === "pickup" ? "Pickup Info" : "Delivery Info"}
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            {order.deliveryType === "delivery" && order.address && (
              <p>
                {order.address.street}, {order.address.city},{" "}
                {order.address.state} {order.address.zipCode}
              </p>
            )}
            {order.deliveryType === "pickup" && (
              <p>123 Pizza Street, New York, NY 10001</p>
            )}
            <p>Phone: {order.phone}</p>
            <p className="text-xs text-gray-400 mt-2">
              Ordered{" "}
              {new Date(order.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
