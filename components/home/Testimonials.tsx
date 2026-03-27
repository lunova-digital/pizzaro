"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Best pizza in town! The crust is perfectly crispy and the toppings are always incredibly fresh. Delivered in under 30 minutes.",
    name: "Sarah M.",
    role: "Regular Customer",
    avatar: "SM",
    rating: 5,
    color: "bg-orange-100 text-orange-700",
  },
  {
    text: "Super fast delivery and the pizza always arrives hot. Pizzaro has become our family's Friday night tradition. Love it!",
    name: "Mike R.",
    role: "Verified Buyer",
    avatar: "MR",
    rating: 5,
    color: "bg-blue-100 text-blue-700",
  },
  {
    text: "The BBQ Chicken pizza is absolutely phenomenal. The smoky flavor with fresh cilantro is unlike anything I've had. 10/10.",
    name: "Emily K.",
    role: "Food Blogger",
    avatar: "EK",
    rating: 5,
    color: "bg-green-100 text-green-700",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
            <Star className="h-4 w-4 fill-current" />
            4.9 Average Rating
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            What Customers Say
          </h2>
          <p className="mt-4 text-muted-fg text-lg">
            Join over 10,000 happy pizza lovers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ y: 16 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="bg-surface rounded-3xl p-7 border border-border shadow-sm shadow-orange-100 relative"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/15 mb-4" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-dark leading-relaxed text-[15px] mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} font-bold text-sm flex items-center justify-center`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t.name}</p>
                  <p className="text-muted-fg text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
