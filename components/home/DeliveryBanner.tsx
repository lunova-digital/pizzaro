"use client";

import Link from "next/link";
import { Truck, Store, ArrowRight } from "lucide-react";

export default function DeliveryBanner() {
  return (
    <section className="py-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-orange-400 p-0.5 shadow-2xl shadow-primary/30">
          <div className="relative rounded-[2.4rem] bg-gradient-to-br from-primary to-orange-500 px-8 py-16 lg:px-16 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div className="text-white">
                <h2
                  className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Delivery or Pickup — You Choose!
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-md">
                  Get free delivery on orders over $25, or swing by and pick up your order fresh from the oven.
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-primary font-bold text-base hover:bg-orange-50 transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Order Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Truck, title: "Home Delivery", desc: "Free over $25 · 30 min", bg: "bg-white/15" },
                  { icon: Store, title: "Store Pickup", desc: "Ready in 20 min · No fee", bg: "bg-white/10" },
                ].map(({ icon: Icon, title, desc, bg }) => (
                  <div key={title} className={`${bg} backdrop-blur-sm rounded-2xl p-5 border border-white/20`}>
                    <Icon className="h-7 w-7 text-white mb-3" />
                    <h4 className="text-white font-bold text-base mb-1">{title}</h4>
                    <p className="text-white/70 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
