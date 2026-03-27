"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Best pizza in town! The crust is perfectly crispy and the toppings are always fresh.",
    name: "Sarah M.",
  },
  {
    text: "Super fast delivery and the pizza always arrives hot. Pizzaro is our family's go-to!",
    name: "Mike R.",
  },
  {
    text: "The BBQ Chicken pizza is absolutely amazing. I order it every week!",
    name: "Emily K.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ y: 15 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-3" />
              <p className="text-gray-600 leading-relaxed">{t.text}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-dark">{t.name}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-secondary text-secondary"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
