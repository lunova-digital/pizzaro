"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import ComboCard from "./ComboCard";
import { useLang } from "@/contexts/LanguageContext";

interface Combo {
  _id: string;
  name: string;
  description: string;
  items: string[];
  price: number;
  image: string;
}

export default function ComboSection() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/combos")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCombos(data); })
      .catch(() => {});
  }, []);

  if (combos.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <Gift className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          {t("combo.sectionTitle")}
        </h2>
        <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {combos.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {combos.map((combo) => (
          <ComboCard key={combo._id} combo={combo} />
        ))}
      </div>
    </section>
  );
}
