"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Clock } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

interface FeaturedCombo {
  _id: string;
  name: string;
  name_bn: string;
  description: string;
  description_bn: string;
  price: number;
  image: string;
  offerEndsAt?: string;
}

function getCountdown(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (diff === 0) return "Expired";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FeaturedCombos() {
  const [combos, setCombos] = useState<FeaturedCombo[]>([]);
  const [tick, setTick] = useState(0);
  const { lang } = useLang();
  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/combos?featured=true")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCombos(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (combos.length === 0) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [combos]);

  if (combos.length === 0) return null;

  function handleComboOrder(combo: FeaturedCombo) {
    addItem({
      pizzaId: combo._id,
      name: lang === "bn" && combo.name_bn ? combo.name_bn : combo.name,
      size: lang === "bn" ? "কম্বো" : "Combo",
      price: combo.price,
      quantity: 1,
      toppings: [],
      image: combo.image,
    });
    router.push("/checkout");
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-red-50 via-bg to-orange-50 relative overflow-hidden" id="combos">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-red-600 bg-red-100 px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-4 shadow-sm border border-red-200">
            {lang === "bn" ? "বিশেষ কম্বো ডিলস" : "Special Combo Deals"}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-dark tracking-tight leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {lang === "bn" ? "সেরা কম্বো অফারগুলো" : "Bang For The Buck!"}
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            {lang === "bn" 
              ? "অল্প খরচে আপনার প্রিয় সব স্বাদ উপভোগ করুন।"
              : "Grab our carefully curated combos to save more and eat better."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {combos.map((combo) => (
            <div 
              key={combo._id} 
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                handleComboOrder(combo);
              }}
              className="cursor-pointer group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-200/50 hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <Image 
                  src={combo.image} 
                  alt={combo.name} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  unoptimized={combo.image?.startsWith("/uploads/")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                  {lang === "bn" ? "কম্বো ডিল" : "Combo Deal"}
                </div>

                {combo.offerEndsAt && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-red-600 text-xs font-mono font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-100">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    {getCountdown(combo.offerEndsAt)}
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1 gap-4">
                <div>
                  <h3 className="font-bold text-2xl text-dark group-hover:text-primary transition-colors">
                    {lang === "bn" && combo.name_bn ? combo.name_bn : combo.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {lang === "bn" && combo.description_bn ? combo.description_bn : combo.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="text-3xl font-black text-primary">
                    ৳{combo.price}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComboOrder(combo);
                    }}
                    className="flex items-center gap-2 bg-dark hover:bg-primary text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-md"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {lang === "bn" ? "অর্ডার দিন" : "Order Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
