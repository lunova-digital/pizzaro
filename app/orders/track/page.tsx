"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ArrowRight } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!orderId.trim()) {
      setError("Please enter your Order ID");
      return;
    }
    if (!contact.trim()) {
      setError(`Please enter your ${contactType === "email" ? "email address" : "phone number"}`);
      return;
    }

    setLoading(true);
    try {
      const param = contactType === "email"
        ? `email=${encodeURIComponent(contact.trim().toLowerCase())}`
        : `phone=${encodeURIComponent(contact.trim())}`;

      const res = await fetch(`/api/orders/${orderId.trim()}?${param}`);

      if (res.status === 404) {
        setError("No order found. Please check your Order ID and contact details.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Could not find that order. Please double-check your details.");
        setLoading(false);
        return;
      }

      router.push(`/orders/${orderId.trim()}?${param}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Icon + heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1
            className="text-3xl font-bold text-dark"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Track Your Order
          </h1>
          <p className="text-muted-fg mt-2">
            Enter your Order ID and email or phone number to see your order status.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-5"
        >
          {/* Order ID */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. 64A2B3C4D5E6"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
            />
            <p className="text-xs text-muted-fg mt-1">
              Find this in your order confirmation or order history.
            </p>
          </div>

          {/* Contact type toggle */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Verify with
            </label>
            <div className="flex rounded-xl border border-border overflow-hidden mb-3">
              <button
                type="button"
                onClick={() => setContactType("email")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  contactType === "email"
                    ? "bg-primary text-white"
                    : "bg-surface text-muted-fg hover:bg-muted"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactType("phone")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  contactType === "phone"
                    ? "bg-primary text-white"
                    : "bg-surface text-muted-fg hover:bg-muted"
                }`}
              >
                Phone
              </button>
            </div>

            <input
              type={contactType === "email" ? "email" : "tel"}
              placeholder={
                contactType === "email"
                  ? "you@example.com"
                  : "(555) 123-4567"
              }
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {error && (
            <div className="text-sm text-danger bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                Track Order
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-fg mt-6">
          Have an account?{" "}
          <a href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </a>{" "}
          to see all your orders.
        </p>
      </div>
    </div>
  );
}
