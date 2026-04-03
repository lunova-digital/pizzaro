"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/contexts/LanguageContext";

interface Category {
  name: string;
  name_bn?: string;
}

interface CategoryFilterProps {
  categories: (string | Category)[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const { lang, t } = useLang();

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => {
        // Support both plain string and object with name_bn
        const value = typeof cat === "string" ? cat : cat.name;
        const label =
          value === "All"
            ? t("menu.all")
            : typeof cat === "object" && cat.name_bn && lang === "bn"
            ? cat.name_bn
            : value;

        return (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer",
              selected === value
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-white text-dark border border-border hover:border-primary/40 hover:text-primary hover:shadow-sm"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
