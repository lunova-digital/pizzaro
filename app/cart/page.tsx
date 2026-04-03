"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const { t } = useLang();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-dark mb-2">
          {t("cart.empty")}
        </h2>
        <p className="text-gray-500 mb-6">
          {t("cart.emptyHint")}
        </p>
        <Link
          href="/menu"
          className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors"
        >
          {t("cart.browseMenu")}
        </Link>
      </div>
    );
  }

  const delivery = totalPrice() >= 25 ? 0 : 4.99;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-dark">{t("cart.title")}</h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-primary transition-colors"
          >
            {t("cart.clearAll")}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-xl p-4 flex gap-4 shadow-sm"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-dark">{item.name}</h3>
                        <p className="text-sm text-gray-400">
                          {item.size}
                          {item.toppings.length > 0 &&
                            ` + ${item.toppings.join(", ")}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-primary transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-bold text-dark">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("cart.continueShopping")}
            </Link>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-24">
            <h2 className="font-bold text-lg text-dark mb-4">{t("cart.orderSummary")}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>
                  {t("cart.subtotal")} ({items.reduce((s, i) => s + i.quantity, 0)} {t("cart.items")})
                </span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{t("cart.delivery")}</span>
                <span>{delivery === 0 ? t("cart.free") : formatPrice(delivery)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark text-base">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(totalPrice() + delivery)}</span>
              </div>
            </div>
            {totalPrice() < 25 && (
              <p className="text-xs text-gray-400 mt-2">
                {t("cart.add")} {formatPrice(25 - totalPrice())} {t("cart.freeDelivery")}
              </p>
            )}
            <Link
              href="/checkout"
              className="mt-6 block w-full py-3 bg-primary text-white font-bold text-center rounded-xl hover:bg-primary-dark transition-colors"
            >
              {t("cart.checkout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
