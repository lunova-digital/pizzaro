"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Star, Truck } from "lucide-react";

const badges = [
  { icon: Clock, label: "30-min delivery" },
  { icon: Star, label: "4.9 rated" },
  { icon: Truck, label: "Free over $25" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div
            initial={{ x: -24 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Now delivering in your area
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Freshly Made
              <span className="block text-primary relative">
                Pizza
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="#EA580C" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
              <span className="text-foreground/80"> Delivered Hot</span>
            </h1>

            <p className="text-lg text-muted-fg leading-relaxed max-w-md mb-8">
              Handcrafted with the finest ingredients, baked to golden perfection, and delivered straight to your door in 30 minutes or less.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Order Now
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-foreground/15 text-foreground font-bold text-base hover:border-primary hover:text-primary transition-all"
              >
                See Menu
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4">
              {badges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-surface rounded-xl px-4 py-2.5 border border-border shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-dark">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ scale: 0.93 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent scale-110 blur-2xl" />

            {/* Floating card */}
            <div className="absolute -top-4 -left-4 z-10 bg-surface rounded-2xl px-4 py-3 shadow-xl shadow-orange-100 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-dark">Order Placed!</p>
                  <p className="text-xs text-muted-fg">Arriving in 28 min</p>
                </div>
              </div>
            </div>

            {/* Rating card */}
            <div className="absolute -bottom-4 -right-4 z-10 bg-surface rounded-2xl px-4 py-3 shadow-xl shadow-orange-100 border border-border">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  ))}
                </div>
                <span className="text-xs font-bold text-dark">4.9 / 5</span>
              </div>
              <p className="text-xs text-muted-fg mt-0.5">2,400+ reviews</p>
            </div>

            <div className="relative aspect-square max-w-lg mx-auto">
              <Image
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&h=700&fit=crop"
                alt="Fresh delicious pizza"
                width={600}
                height={600}
                className="rounded-[2.5rem] shadow-2xl shadow-orange-200 object-cover w-full h-full"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
