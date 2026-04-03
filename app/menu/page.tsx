"use client";

import { useEffect, useState, Suspense } from "react";
import CategoryFilter from "@/components/menu/CategoryFilter";
import PizzaCard from "@/components/menu/PizzaCard";
import ComboSection from "@/components/menu/ComboSection";
import { Search } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";

interface Pizza {
  _id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  image: string;
  sizes: { name: string; price: number }[];
  category: string;
  averageRating?: number;
  ratingCount?: number;
}

interface Category {
  name: string;
  name_bn?: string;
}

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ name: "All" }]);
  const [selected, setSelected] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    async function load() {
      try {
        const [pizzaRes, catRes] = await Promise.all([
          fetch("/api/pizzas"),
          fetch("/api/categories"),
        ]);
        const pizzaData = await pizzaRes.json();
        const catData = await catRes.json();
        setPizzas(pizzaData);
        setCategories([
          { name: "All" },
          ...catData.map((c: { name: string; name_bn?: string }) => ({
            name: c.name,
            name_bn: c.name_bn,
          })),
        ]);
      } catch {
        console.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = pizzas.filter((p) => {
    const matchesCategory = selected === "All" || p.category === selected;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero banner ──────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary via-primary-dark to-red-800 rounded-3xl overflow-hidden mb-10 px-6 sm:px-10 py-12 text-center">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-14 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-4 left-1/4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

          <h1 className="relative z-10 text-3xl sm:text-5xl font-bold text-white leading-tight">
            {t("menu.title")}
          </h1>
          <p className="relative z-10 mt-2 text-orange-100 text-sm sm:text-base">
            {t("menu.subtitle")}
          </p>

          {/* Search bar */}
          <div className="relative z-10 max-w-md mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("menu.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-dark placeholder:text-gray-400 shadow-2xl text-sm"
            />
          </div>
        </div>

        {/* ── Combo Offers ────────────────────────────────── */}
        <ComboSection />

        {/* ── Category filter ──────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <CategoryFilter
            categories={categories}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* ── Results count ────────────────────────────────── */}
        {!loading && (
          <p className="text-sm text-muted-fg text-center mb-6">
            {filtered.length} {filtered.length !== 1 ? t("menu.items") : t("menu.item")}
            {selected !== "All" ? ` ${t("menu.in")} ${selected}` : ""}
            {search ? ` ${t("menu.matching")} "${search}"` : ""}
          </p>
        )}

        {/* ── Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-border animate-pulse"
              >
                <div className="h-56 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-4/5" />
                  <div className="h-10 bg-gray-100 rounded-2xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-fg">
            <div className="text-5xl mb-4">🍕</div>
            <p className="text-xl font-bold text-dark">{t("menu.noPizzas")}</p>
            <p className="mt-1 text-sm">{t("menu.noPizzasHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-fg font-medium">Loading menu...</p>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
