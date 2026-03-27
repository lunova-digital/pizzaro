"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ChefHat, Truck } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Choose Your Pizza",
    description: "Browse our menu and customize your perfect pizza",
  },
  {
    icon: ChefHat,
    title: "We Prepare It Fresh",
    description: "Our chefs handcraft your pizza with fresh ingredients",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Hot pizza delivered to your door in 30 minutes or less",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Three simple steps to pizza paradise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ y: 15 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <step.icon className="h-9 w-9 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white text-sm font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{step.title}</h3>
              <p className="text-gray-500 max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
