"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight">
              Fresh Hot Pizza,{" "}
              <span className="text-primary">Delivered</span> to Your Door
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              Handcrafted with love using the freshest ingredients. Order now
              and taste the difference.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors shadow-lg"
              >
                Order Now
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center px-8 py-3 rounded-full border-2 border-dark text-dark font-semibold hover:bg-dark hover:text-white transition-colors"
              >
                View Menu
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <Image
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop"
                alt="Delicious pizza"
                width={600}
                height={600}
                className="rounded-3xl shadow-2xl object-cover w-full h-full"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
