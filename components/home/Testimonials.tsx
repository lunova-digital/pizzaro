"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Testimonials() {
  const { t } = useLang();

  const testimonials = [
    {
      text: t("testimonials.t1Text"),
      name: t("testimonials.t1Name"),
      role: t("testimonials.t1Role"),
      avatar: "SM",
      rating: 5,
      color: "bg-orange-100 text-orange-700",
    },
    {
      text: t("testimonials.t2Text"),
      name: t("testimonials.t2Name"),
      role: t("testimonials.t2Role"),
      avatar: "MR",
      rating: 5,
      color: "bg-blue-100 text-blue-700",
    },
    {
      text: t("testimonials.t3Text"),
      name: t("testimonials.t3Name"),
      role: t("testimonials.t3Role"),
      avatar: "EK",
      rating: 5,
      color: "bg-green-100 text-green-700",
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="bg-surface rounded-3xl p-7 border border-border shadow-sm shadow-orange-100 relative"
            >
              <Quote className="h-8 w-8 text-primary/15 mb-4" />

              <div className="flex gap-0.5 mb-4">
                {[...Array(item.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-dark leading-relaxed text-[15px] mb-6">
                &ldquo;{item.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.color} font-bold text-sm flex items-center justify-center`}>
                  {item.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{item.name}</p>
                  <p className="text-muted-fg text-xs">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
