"use client";

import Image from "next/image";
import { useState } from "react";
import { Gift, ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLang } from "@/contexts/LanguageContext";

interface Combo {
  _id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  items: string[];
  price: number;
  image: string;
}

export default function ComboCard({ combo }: { combo: Combo }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const { t, lang } = useLang();

  const displayName = lang === "bn" && combo.name_bn ? combo.name_bn : combo.name;
  const displayDesc = lang === "bn" && combo.description_bn ? combo.description_bn : combo.description;

  function handleAdd() {
    addItem({
      pizzaId: combo._id,
      comboId: combo._id,
      type: "combo",
      name: displayName,
      size: "",
      price: combo.price,
      quantity: 1,
      toppings: [],
      image: combo.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="relative flex flex-col bg-foreground text-white rounded-3xl overflow-hidden shadow-xl shadow-black/20 border border-white/10 min-w-[280px] max-w-[320px] shrink-0">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={combo.image}
          alt={displayName}
          fill
          className="object-cover"
          unoptimized={combo.image?.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />

        {/* COMBO badge */}
        <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          <Gift className="h-3.5 w-3.5" />
          COMBO
        </span>

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-primary text-white font-bold text-lg px-3 py-1 rounded-xl">
          ৳{combo.price}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-white mb-1">{displayName}</h3>
        <p className="text-white/60 text-xs mb-3 line-clamp-2">{displayDesc}</p>

        {/* Items */}
        <ul className="space-y-1 mb-4 flex-1">
          {combo.items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            added
              ? "bg-green-500 text-white"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {t("combo.addToCart")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
