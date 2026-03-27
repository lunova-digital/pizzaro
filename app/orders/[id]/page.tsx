"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle, Clock, ChefHat, Truck, Package,
  ArrowLeft, Download, Pizza, MapPin, Phone, Mail,
} from "lucide-react";

interface Order {
  _id: string;
  guestName?: string;
  guestEmail?: string;
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

const statusLabel: Record<string, string> = {
  placed: "Order Placed",
  preparing: "Preparing",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  "ready-for-pickup": "Ready for Pickup",
  "picked-up": "Picked Up",
};

const statusColor: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  preparing: "bg-yellow-100 text-yellow-700",
  "out-for-delivery": "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  "ready-for-pickup": "bg-purple-100 text-purple-700",
  "picked-up": "bg-green-100 text-green-700",
};

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const guestEmail = searchParams.get("email");
  const guestPhone = searchParams.get("phone");
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      let url = `/api/orders/${params.id}`;
      if (guestEmail) url += `?email=${encodeURIComponent(guestEmail)}`;
      else if (guestPhone) url += `?phone=${encodeURIComponent(guestPhone)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setOrder(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [params.id, guestEmail, guestPhone]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <Package className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500 font-medium">Order not found</p>
        <Link href="/orders/track" className="text-primary text-sm hover:underline">
          Track your order
        </Link>
      </div>
    );
  }

  const steps = order.deliveryType === "pickup" ? pickupSteps : deliverySteps;
  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = order.totalAmount - subtotal;
  const shortId = order._id.slice(-8).toUpperCase();
  const orderedAt = new Date(order.createdAt);

  return (
    <>
      {/* Print styles injected via style tag */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-printable, #invoice-printable * { visibility: visible !important; }
          #invoice-printable { position: fixed; inset: 0; padding: 32px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-2xl">

          {/* Back + actions — hidden on print */}
          <div className="no-print flex items-center justify-between mb-6">
            <Link
              href={guestEmail || guestPhone ? "/orders/track" : "/orders"}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-dark transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {guestEmail || guestPhone ? "Back to Tracking" : "My Orders"}
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </button>
          </div>

          {/* Success banner — new orders only */}
          {isNew && (
            <div className="no-print mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <h2 className="font-bold text-dark text-lg">Order Placed Successfully!</h2>
              <p className="text-sm text-gray-500 mt-1">
                We&apos;ve received your order and are getting started on it.
              </p>
              {(guestEmail || guestPhone) && (
                <p className="text-xs text-gray-400 mt-2">
                  Save your Order ID: <span className="font-mono font-bold text-dark">{shortId}</span> — you&apos;ll need it to track your order.
                </p>
              )}
            </div>
          )}

          {/* ── INVOICE ── */}
          <div
            id="invoice-printable"
            ref={invoiceRef}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6"
          >
            {/* Invoice header */}
            <div className="bg-gradient-to-r from-primary to-orange-400 px-8 py-7 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Pizza className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                      Pizzaro
                    </h1>
                    <p className="text-white/70 text-xs">Order Confirmation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs mb-0.5">Order ID</p>
                  <p className="font-mono font-bold text-lg tracking-wider">{shortId}</p>
                  <span className={`mt-1 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Date + type row */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 px-8 py-4 bg-orange-50/60 border-b border-orange-100 text-sm">
              <div>
                <span className="text-gray-400">Date: </span>
                <span className="font-medium text-dark">
                  {orderedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Time: </span>
                <span className="font-medium text-dark">
                  {orderedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Type: </span>
                <span className="font-medium text-dark capitalize">{order.deliveryType}</span>
              </div>
              <div>
                <span className="text-gray-400">Payment: </span>
                <span className="font-medium text-dark">Cash on Delivery</span>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Billed to */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Customer Details
                </h3>
                <div className="space-y-1.5 text-sm text-gray-600">
                  {order.guestName && (
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="font-medium text-dark">{order.guestName}</span>
                    </div>
                  )}
                  {order.guestEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      {order.guestEmail}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    {order.phone}
                  </div>
                  {order.deliveryType === "delivery" && order.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                      <span>
                        {order.address.street}, {order.address.city},{" "}
                        {order.address.state} {order.address.zipCode}
                      </span>
                    </div>
                  )}
                  {order.deliveryType === "pickup" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span>Pickup — 123 Pizza Street, New York, NY 10001</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items table */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Order Items
                </h3>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Item</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500">Qty</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500">Unit</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-dark">
                              {item.name}
                              <span className="text-gray-400 font-normal ml-1 text-xs">({item.size})</span>
                            </p>
                            {item.toppings.length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                + {item.toppings.join(", ")}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatPrice(item.price)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-dark">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}</span>
                </div>
                <div className="flex justify-between font-bold text-dark text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Footer note */}
              <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                Thank you for ordering from Pizzaro! · hello@pizzaro.com · (555) 123-4567
              </p>
            </div>
          </div>

          {/* Status tracker — hidden on print */}
          <div className="no-print bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-dark">Order Status</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[order.status] ?? "bg-gray-100"}`}>
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>

            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 mx-6">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= currentStepIndex;
                  const current = i === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 w-1/4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-500
                        ${done ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-gray-100 text-gray-300"}
                        ${current ? "ring-4 ring-primary/20 scale-110" : ""}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight ${done ? "text-dark" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">Status updates every 30 seconds</p>
          </div>

          {/* CTA */}
          <div className="no-print text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors"
            >
              <Pizza className="h-4 w-4" />
              Order More
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
