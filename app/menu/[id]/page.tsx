"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Minus, Plus, ArrowLeft, Check, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLang } from "@/contexts/LanguageContext";

interface Pizza {
  _id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  image: string;
  category: string;
  sizes: { name: string; price: number }[];
  toppings: string[];
  averageRating?: number;
  ratingCount?: number;
}

export default function PizzaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { t, lang } = useLang();

  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pizzas/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPizza(data);
      } catch {
        router.push("/menu");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  // Must be before any conditional return — hooks cannot follow a return
  useEffect(() => {
    setAdded(false);
  }, [selectedSize, selectedToppings, quantity]);

  if (loading || !pizza) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPrice = pizza.sizes[selectedSize].price;
  const toppingPrice = selectedToppings.length * 1.5;
  const totalPrice = (currentPrice + toppingPrice) * quantity;

  function toggleTopping(topping: string) {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  }

  function handleAddToCart() {
    addItem({
      pizzaId: pizza!._id,
      name: pizza!.name,
      size: pizza!.sizes[selectedSize].name,
      price: currentPrice + toppingPrice,
      quantity,
      toppings: selectedToppings,
      image: pizza!.image,
    });
    setAdded(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-dark mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("detail.back")}
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ x: -10 }}
            animate={{ x: 0 }}
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg">
              <Image
                src={pizza.image}
                alt={pizza.name}
                fill
                className="object-cover"
                priority
                unoptimized={pizza.image?.startsWith("/uploads/")}
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ x: 10 }}
            animate={{ x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {pizza.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="text-sm font-bold text-dark">
                    {pizza.ratingCount && pizza.ratingCount > 0
                      ? pizza.averageRating?.toFixed(1)
                      : t("detail.new")}
                  </span>
                  {pizza.ratingCount && pizza.ratingCount > 0 ? (
                    <span className="text-xs text-gray-400">({pizza.ratingCount} {t("detail.ratings")})</span>
                  ) : null}
                </div>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-dark">
                {lang === "bn" && pizza.name_bn ? pizza.name_bn : pizza.name}
              </h1>
              <p className="mt-3 text-gray-500 text-lg">
                {lang === "bn" && pizza.description_bn ? pizza.description_bn : pizza.description}
              </p>
            </div>

            {/* Size */}
            <div>
              <h3 className="font-semibold text-dark mb-3">{t("detail.chooseSize")}</h3>
              <div className="flex gap-3">
                {pizza.sizes.map((size, i) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(i)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all",
                      selectedSize === i
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <div>{size.name}</div>
                    <div className="text-xs mt-0.5">
                      {formatPrice(size.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            {pizza.toppings.length > 0 && (
              <div>
                <h3 className="font-semibold text-dark mb-3">
                  {t("detail.extraToppings")}{" "}
                  <span className="text-gray-400 text-sm font-normal">
                    (+{formatPrice(1.50)} {t("detail.each")})
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pizza.toppings.map((topping) => (
                    <button
                      key={topping}
                      onClick={() => toggleTopping(topping)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1",
                        selectedToppings.includes(topping)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {selectedToppings.includes(topping) && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {topping}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-dark mb-3">{t("detail.quantity")}</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">{t("detail.total")}</span>
                <span className="text-2xl font-bold text-dark">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              {added ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setAdded(false)}
                    className="flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-green-500 text-white"
                  >
                    <Check className="h-5 w-5" /> {t("detail.added")}
                  </button>
                  <Link
                    href="/checkout"
                    className="flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    {t("detail.checkout")} <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-dark transition-all"
                >
                  <ShoppingCart className="h-5 w-5" /> {t("detail.add")}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
