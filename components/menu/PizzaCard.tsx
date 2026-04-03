"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

interface PizzaCardProps {
  pizza: {
    _id: string;
    name: string;
    name_bn?: string;
    description: string;
    description_bn?: string;
    image: string;
    sizes: { name: string; price: number }[];
    category: string;
    averageRating?: number;
    ratingCount?: number;
  };
}

const categoryStyle: Record<string, string> = {
  Regular:      "bg-orange-600 text-white",
  Premium:      "bg-purple-700 text-white",
  "Garlic Bread": "bg-amber-600 text-white",
};

export default function PizzaCard({ pizza }: PizzaCardProps) {
  const badgeClass = categoryStyle[pizza.category] ?? "bg-gray-600 text-white";
  const hasRating = (pizza.ratingCount ?? 0) > 0;
  const { t, lang } = useLang();

  const displayName = lang === "bn" && pizza.name_bn ? pizza.name_bn : pizza.name;
  const displayDesc = lang === "bn" && pizza.description_bn ? pizza.description_bn : pizza.description;
  const minPrice = Math.min(...pizza.sizes.map((s) => s.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl overflow-hidden border border-border shadow-sm shadow-orange-100/60 group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <Image
          src={pizza.image}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized={pizza.image?.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {pizza.category}
        </span>
        {/* Rating */}
        {hasRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {pizza.averageRating?.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-dark text-base leading-tight mb-1">{displayName}</h3>
        <p className="text-muted-fg text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
          {displayDesc}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary">৳{minPrice}</span>
          <span className="text-xs text-muted-fg">
            {pizza.sizes.length} size{pizza.sizes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Link
          href={`/menu/${pizza._id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary text-sm font-bold rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-200 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          {t("menu.customizeOrder")}
        </Link>
      </div>
    </motion.div>
  );
}
