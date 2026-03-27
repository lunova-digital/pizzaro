"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DeliveryBanner() {
  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Delivery or Pickup — You Choose!
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
          Free delivery on orders over $25. Or pick up and skip the wait!
        </p>
        <Link
          href="/menu"
          className="mt-8 inline-flex px-8 py-3 rounded-full bg-white text-primary font-bold hover:bg-gray-100 transition-colors shadow-lg"
        >
          Order Now
        </Link>
      </div>
    </section>
  );
}
