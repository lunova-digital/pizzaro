"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer",
            selected === cat
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "bg-white text-dark border border-border hover:border-primary/40 hover:text-primary hover:shadow-sm"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
