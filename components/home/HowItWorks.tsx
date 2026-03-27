"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ChefHat, Truck } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    number: "01",
    title: "Choose Your Pizza",
    description: "Browse our handcrafted menu. Pick a pizza, choose your size, and add extra toppings.",
    color: "bg-orange-50",
    iconColor: "text-primary",
    borderColor: "border-orange-200",
  },
  {
    icon: ChefHat,
    number: "02",
    title: "We Bake It Fresh",
    description: "Our chefs handcraft your order with fresh dough and premium ingredients.",
    color: "bg-blue-50",
    iconColor: "text-accent",
    borderColor: "border-blue-200",
  },
  {
    icon: Truck,
    number: "03",
    title: "Hot Delivery",
    description: "Your pizza arrives at your door in 30 minutes or less, guaranteed hot.",
    color: "bg-green-50",
    iconColor: "text-success",
    borderColor: "border-green-200",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
            Simple &amp; Fast
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How It Works
          </h2>
          <p className="mt-4 text-muted-fg text-lg">
            From craving to delivery in three easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting arrows on desktop */}
          <div className="hidden md:flex absolute top-16 left-[33%] right-[33%] items-center justify-center pointer-events-none z-10">
            <div className="w-full border-t-2 border-dashed border-border" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.35 }}
              className="flex flex-col items-center text-center relative"
            >
              {/* Icon box */}
              <div
                className={`relative z-10 w-20 h-20 rounded-3xl ${step.color} border-2 ${step.borderColor} flex items-center justify-center mb-6 shadow-sm`}
              >
                <step.icon className={`h-9 w-9 ${step.iconColor}`} />
                <span className="absolute -top-3 -right-3 w-7 h-7 bg-foreground text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {step.number}
                </span>
              </div>
              <h3
                className="text-xl font-bold text-foreground mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {step.title}
              </h3>
              <p className="text-muted-fg text-[15px] leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
