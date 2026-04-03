"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Star, Flame } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const pizzaData = [
  {
    name: "Margherita",
    name_bn: "মার্গেরিটা",
    description: "Classic tomato sauce, fresh mozzarella, hand-torn basil",
    description_bn: "ক্লাসিক টমেটো সস, তাজা মোৎজারেলা, হাতে ছেঁড়া বেসিল",
    price: 12.99,
    rating: 4.9,
    tag: "Classic",
    tag_bn: "ক্লাসিক",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
  },
  {
    name: "Pepperoni",
    name_bn: "পেপেরনি",
    description: "Loaded double pepperoni, mozzarella, tangy tomato sauce",
    description_bn: "ডাবল পেপেরনি, মোৎজারেলা, টমেটো সস",
    price: 14.99,
    rating: 4.8,
    tag: "Bestseller",
    tag_bn: "বেস্টসেলার",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
  },
  {
    name: "BBQ Chicken",
    name_bn: "বিবিকিউ চিকেন",
    description: "Grilled chicken, smoky BBQ, red onions, fresh cilantro",
    description_bn: "গ্রিলড চিকেন, ধোঁয়াটে বিবিকিউ, লাল পেঁয়াজ, তাজা ধনেপাতা",
    price: 15.99,
    rating: 4.9,
    tag: "Popular",
    tag_bn: "জনপ্রিয়",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
  },
  {
    name: "Veggie Supreme",
    name_bn: "ভেজি সুপ্রিম",
    description: "Bell peppers, mushrooms, olives, onions, cherry tomatoes",
    description_bn: "বেল পেপার, মাশরুম, অলিভ, পেঁয়াজ, চেরি টমেটো",
    price: 13.99,
    rating: 4.7,
    tag: "Veggie",
    tag_bn: "ভেজি",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop",
  },
];

const tagColors: Record<string, string> = {
  Classic:    "bg-orange-100 text-orange-700",
  Bestseller: "bg-red-100 text-red-700",
  Popular:    "bg-yellow-100 text-yellow-700",
  Veggie:     "bg-green-100 text-green-700",
};

export default function FeaturedPizzas() {
  const { t, lang } = useLang();

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pizzaData.map((pizza, i) => (
            <motion.div
              key={pizza.name}
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-surface rounded-3xl overflow-hidden shadow-md shadow-orange-100/80 border border-border group cursor-pointer"
            >
              <Link href="/menu">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={pizza.image}
                    alt={lang === "bn" ? pizza.name_bn : pizza.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized={pizza.image.startsWith("/uploads/")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  {/* Tag */}
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${tagColors[pizza.tag]}`}>
                    {lang === "bn" ? pizza.tag_bn : pizza.tag}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-bold text-foreground text-lg leading-tight">
                      {lang === "bn" ? pizza.name_bn : pizza.name}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0 ml-2">
                      <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                      <span className="text-xs font-bold text-dark">{pizza.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-fg text-sm leading-relaxed line-clamp-2 mb-4">
                    {lang === "bn" ? pizza.description_bn : pizza.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(pizza.price)}
                    </span>
                    <span className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-200">
                      {t("featured.order")}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

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
