"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useLang } from "@/contexts/LanguageContext";

interface ComboCardProps {
  combo: {
    _id: string;
    name: string;
    description: string;
    items: string[];
    price: number;
    image: string;
  };
}

export default function ComboCard({ combo }: ComboCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useLang();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      pizzaId: combo._id,
      comboId: combo._id,
      type: "combo",
      name: combo.name,
      size: "",
      price: combo.price,
      quantity: 1,
      toppings: [],
      image: combo.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-dark text-white rounded-3xl overflow-hidden shadow-lg group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={combo.image}
          alt={combo.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={combo.image.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Tag className="h-3 w-3" />
          COMBO
        </span>
        <span className="absolute bottom-3 right-3 bg-primary font-bold text-lg px-4 py-1 rounded-2xl shadow-lg">
          ৳{combo.price}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1 leading-snug">{combo.name}</h3>
        <ul className="space-y-1 mb-4 flex-1">
          {combo.items.map((item, i) => (
            <li key={i} className="text-white/70 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            added
              ? "bg-success text-white"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {added ? "✓ Added!" : t("combo.addToCart")}
        </button>
      </div>
    </motion.div>
  );
}
