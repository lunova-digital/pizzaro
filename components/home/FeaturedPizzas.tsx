"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Star, Flame } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

interface Category {
  _id: string;
  name: string;
  name_bn?: string;
  slug: string;
}

interface Pizza {
  _id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  category: string;
  sizes: { name: string; price: number }[];
  image: string;
  averageRating?: number;
}

const categoryColors: Record<string, string> = {
  Regular:      "bg-orange-600 text-white",
  Premium:      "bg-purple-700 text-white",
  "Garlic Bread": "bg-amber-600 text-white",
};

export default function FeaturedPizzas() {
  const { t, lang } = useLang();
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch("/api/pizzas")
      .then((res) => res.json())
      .then((data) => {
        // Take top 4 pizzas (maybe random or first 4 for now to represent Best Sellers)
        if (Array.isArray(data)) {
          setPizzas(data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
            <Flame className="h-4 w-4" />
            {t("featured.badge")}
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("featured.title")}
          </h2>
          <p className="mt-4 text-muted-fg text-lg max-w-md mx-auto">
            {t("featured.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md border border-border h-[420px] animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-md w-full" />
                  <div className="h-4 bg-gray-200 rounded-md w-2/3" />
                  <div className="pt-4 flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded-md w-16" />
                    <div className="h-10 bg-gray-200 rounded-xl w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pizzas.map((pizza, i) => {
              const catName = pizza.category || "Regular";
              // Using predefined translated string fallback for demo purposes or we can just leave it as is if category is plain string
              const catNameBn = catName === "Regular" ? "রেগুলার" : 
                                catName === "Premium" ? "প্রিমিয়াম" : 
                                catName === "Garlic Bread" ? "গার্লিক ব্রেড" : catName;
              
              const price = pizza.sizes?.[0]?.price || 0;
              const sizeName = pizza.sizes?.[0]?.name || "Regular";
              const displayName = lang === "bn" && pizza.name_bn ? pizza.name_bn : pizza.name;
              
              const handleOrderAndCheckout = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  pizzaId: pizza._id,
                  type: "pizza",
                  name: displayName,
                  size: sizeName,
                  price: price,
                  quantity: 1,
                  toppings: [],
                  image: pizza.image,
                });
                router.push("/checkout");
              };
              
              return (
                <motion.div
                  key={pizza._id}
                  initial={{ y: 16 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-surface rounded-3xl overflow-hidden shadow-md shadow-orange-100/80 border border-border group cursor-pointer"
                >
                  <Link href={`/menu`}>
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={pizza.image}
                        alt={lang === "bn" && pizza.name_bn ? pizza.name_bn : pizza.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={pizza.image.startsWith("/uploads/")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {/* Tag */}
                      <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[catName] || "bg-orange-100 text-orange-700"}`}>
                        {lang === "bn" ? catNameBn : catName}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1.5">
                        <h3 className="font-bold text-foreground text-lg leading-tight">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-0.5 shrink-0 ml-2">
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          <span className="text-xs font-bold text-dark">{pizza.averageRating || 5.0}</span>
                        </div>
                      </div>
                      <p className="text-muted-fg text-sm leading-relaxed line-clamp-2 mb-4">
                        {lang === "bn" && pizza.description_bn ? pizza.description_bn : pizza.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(price)}
                        </span>
                        <button
                          onClick={handleOrderAndCheckout}
                          className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          {t("featured.order")}
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-200"
          >
            {t("featured.viewMenu")}
          </Link>
        </div>
      </div>
    </section>
  );
}
