"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ChefHat, Truck } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function HowItWorks() {
  const { t } = useLang();

  const steps = [
    {
      icon: ShoppingCart,
      number: "01",
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
      color: "bg-orange-50",
      iconColor: "text-primary",
      borderColor: "border-orange-200",
    },
    {
      icon: ChefHat,
      number: "02",
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
      color: "bg-blue-50",
      iconColor: "text-accent",
      borderColor: "border-blue-200",
    },
    {
      icon: Truck,
      number: "03",
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
      color: "bg-green-50",
      iconColor: "text-success",
      borderColor: "border-green-200",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
            {t("howItWorks.badge")}
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("howItWorks.title")}
          </h2>
          <p className="mt-4 text-muted-fg text-lg">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting dashes on desktop */}
          <div className="hidden md:flex absolute top-16 left-[33%] right-[33%] items-center justify-center pointer-events-none z-10">
            <div className="w-full border-t-2 border-dashed border-border" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.35 }}
              className="flex flex-col items-center text-center relative"
            >
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
