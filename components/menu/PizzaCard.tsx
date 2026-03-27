"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface PizzaCardProps {
  pizza: {
    _id: string;
    name: string;
    description: string;
    image: string;
    sizes: { name: string; price: number }[];
    category: string;
  };
}

export default function PizzaCard({ pizza }: PizzaCardProps) {
  const startingPrice = Math.min(...pizza.sizes.map((s) => s.price));

  return (
    <motion.div
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 group"
    >
      <Link href={`/menu/${pizza._id}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={pizza.image}
            alt={pizza.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 bg-white/90 text-xs font-semibold px-3 py-1 rounded-full text-gray-700">
            {pizza.category}
          </span>
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/menu/${pizza._id}`}>
          <h3 className="font-bold text-dark text-lg hover:text-primary transition-colors">
            {pizza.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {pizza.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">From</span>
            <span className="ml-1 text-xl font-bold text-primary">
              {formatPrice(startingPrice)}
            </span>
          </div>
          <Link
            href={`/menu/${pizza._id}`}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-colors"
          >
            Customize
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
