"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/menu/CategoryFilter";
import PizzaCard from "@/components/menu/PizzaCard";
import { Search } from "lucide-react";

interface Pizza {
  _id: string;
  name: string;
  description: string;
  image: string;
  sizes: { name: string; price: number }[];
  category: string;
}

export default function MenuPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
          "All",
          ...catData.map((c: { name: string }) => c.name),
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark">
            Our Menu
          </h1>
          <p className="mt-2 text-gray-500">
            Choose from our handcrafted selection
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pizzas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex justify-center mb-10">
          <CategoryFilter
            categories={categories}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl">No pizzas found</p>
            <p className="mt-2">Try a different category or search term</p>
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
