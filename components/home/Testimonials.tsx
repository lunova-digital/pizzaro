"use client";

import { motion } from "framer-motion";
import { Star, Quote, ChevronRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Testimonials() {
  const { t, lang } = useLang();
  const [dynamicReviews, setDynamicReviews] = useState<any[]>([]);

  const testimonials = [
    {
      text: t("testimonials.t1Text"),
      name: t("testimonials.t1Name"),
      role: t("testimonials.t1Role"),
      avatar: "SM",
      rating: 5,
      image: "",
      color: "bg-orange-100 text-orange-700",
    },
    {
      text: t("testimonials.t2Text"),
      name: t("testimonials.t2Name"),
      role: t("testimonials.t2Role"),
      avatar: "MR",
      rating: 5,
      image: "",
      color: "bg-blue-100 text-blue-700",
    },
    {
      text: t("testimonials.t3Text"),
      name: t("testimonials.t3Name"),
      role: t("testimonials.t3Role"),
      avatar: "EK",
      rating: 5,
      image: "",
      color: "bg-green-100 text-green-700",
    },
  ];

  useEffect(() => {
    fetch("/api/reviews?limit=3")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicReviews(data);
        }
      })
      .catch(() => {});
  }, []);

  const reviewsToDisplay = dynamicReviews.length > 0 ? dynamicReviews.map((r, i) => ({
    text: r.comment || (lang === 'bn' ? 'অনেক ভালো পিৎজা!' : 'Great pizza experience!'),
    name: r.guestName,
    role: lang === 'bn' ? 'ক্রেতা' : 'Customer',
    avatar: r.guestName.substring(0, 2).toUpperCase(),
    rating: r.rating,
    image: r.image,
    color: i % 3 === 0 ? "bg-orange-100 text-orange-700" : i % 3 === 1 ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700",
  })) : testimonials;

  return (
    <section className="py-20 lg:py-28 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
            <Star className="h-4 w-4 fill-current" />
            {t("testimonials.badge")}
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("testimonials.title")}
          </h2>
          <p className="mt-4 text-muted-fg text-lg">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {reviewsToDisplay.map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="bg-surface rounded-3xl p-7 flex flex-col border border-border shadow-sm shadow-orange-100 relative"
            >
              <Quote className="h-8 w-8 text-primary/15 mb-4" />

              <div className="flex gap-0.5 mb-4">
                {[...Array(item.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-dark leading-relaxed text-[15px] mb-6 flex-1">
                &ldquo;{item.text}&rdquo;
              </p>

              {item.image && (
                <div className="relative w-full h-32 mb-6 rounded-xl overflow-hidden border border-gray-100">
                  <Image src={item.image} alt="Review attachment" fill className="object-cover" unoptimized={item.image.startsWith("/uploads/")} />
                </div>
              )}

              <div className="flex items-center gap-3 mt-auto">
                <div className={`w-10 h-10 rounded-full ${item.color} font-bold text-sm flex items-center justify-center shrink-0`}>
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
                  <p className="text-muted-fg text-xs truncate">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {dynamicReviews.length > 0 && (
          <div className="text-center">
            <Link 
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-dark font-bold text-sm rounded-full border border-gray-200 shadow-sm hover:border-primary hover:text-primary transition-all group"
            >
              {lang === 'bn' ? 'সব রিভিউ দেখুন' : 'View All Reviews'}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
