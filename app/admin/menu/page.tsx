"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Check, ImageIcon, Pencil, Plus, PlusCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Size {
  name: string;
  price: number;
}

interface Pizza {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  sizes: Size[];
  toppings: string[];
  isAvailable: boolean;
}

const DEFAULT_SIZES: Size[] = [
  { name: "Small", price: 9.99 },
  { name: "Medium", price: 12.99 },
  { name: "Large", price: 15.99 },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  category: "",
  sizes: DEFAULT_SIZES as Size[],
  toppings: [] as string[],
};

export default function AdminMenuPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, sizes: [...DEFAULT_SIZES] });
  const [toppingInput, setToppingInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pizzas?all=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPizzas(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setForm({ ...EMPTY_FORM, sizes: DEFAULT_SIZES.map((s) => ({ ...s })), toppings: [] });
    setEditingId(null);
    setError("");
    setToppingInput("");
    setShowForm(true);
  }

  function openEdit(pizza: Pizza) {
    setForm({
      name: pizza.name,
      description: pizza.description,
      image: pizza.image,
      category: pizza.category,
      sizes: pizza.sizes.map((s) => ({ name: s.name, price: s.price })),
      toppings: [...pizza.toppings],
    });
    setEditingId(pizza._id);
    setError("");
    setToppingInput("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setForm((f) => ({ ...f, image: url }));
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function updateSize(i: number, field: "name" | "price", value: string) {
    setForm((f) => {
      const sizes = [...f.sizes];
      sizes[i] = {
        ...sizes[i],
        [field]: field === "price" ? parseFloat(value) || 0 : value,
      };
      return { ...f, sizes };
    });
  }

  function addSize() {
    setForm((f) => ({ ...f, sizes: [...f.sizes, { name: "", price: 0 }] }));
  }

  function removeSize(i: number) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  }

  function addTopping() {
    const t = toppingInput.trim();
    if (!t || form.toppings.includes(t)) return;
    setForm((f) => ({ ...f, toppings: [...f.toppings, t] }));
    setToppingInput("");
  }

  function removeTopping(t: string) {
    setForm((f) => ({ ...f, toppings: f.toppings.filter((x) => x !== t) }));
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim()) { setError("Pizza name is required"); return; }
    if (!form.category.trim()) { setError("Category is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    if (!form.image) { setError("Please upload an image or paste an image URL"); return; }
    if (form.sizes.length === 0) { setError("Add at least one size"); return; }
    const invalidSize = form.sizes.find((s) => !s.name.trim() || s.price <= 0);
    if (invalidSize) { setError("All sizes must have a name and price greater than 0"); return; }

    setSaving(true);
    try {
      const url = editingId ? `/api/pizzas/${editingId}` : "/api/pizzas";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
          category: form.category.trim(),
          sizes: form.sizes,
          toppings: form.toppings,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }
      const pizza = await res.json();
      if (editingId) {
        setPizzas((prev) => prev.map((p) => (p._id === pizza._id ? pizza : p)));
      } else {
        setPizzas((prev) => [pizza, ...prev]);
      }
      closeForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save pizza");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(pizza: Pizza) {
    const res = await fetch(`/api/pizzas/${pizza._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !pizza.isAvailable }),
    });
    if (res.ok) {
      setPizzas((prev) =>
        prev.map((p) =>
          p._id === pizza._id ? { ...p, isAvailable: !p.isAvailable } : p
        )
      );
    }
  }

  async function deletePizza(id: string) {
    if (!confirm("Delete this pizza? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/pizzas/${id}`, { method: "DELETE" });
    if (res.ok) setPizzas((prev) => prev.filter((p) => p._id !== id));
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">Menu ({pizzas.length})</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Pizza
        </button>
      </div>

      {/* ── Form panel ── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark text-lg">
              {editingId ? "Edit Pizza" : "New Pizza"}
            </h2>
            <button
              onClick={closeForm}
              className="p-1 text-gray-400 hover:text-dark transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Pizza Image *
              </label>
              <label className="block cursor-pointer">
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-xl overflow-hidden transition-colors",
                    uploading
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary"
                  )}
                >
                  {form.image ? (
                    <div className="relative w-full aspect-video bg-gray-50">
                      <Image
                        src={form.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized={form.image.startsWith("/uploads/")}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-sm font-semibold">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">
                        {uploading ? "Uploading..." : "Click to upload image"}
                      </p>
                      <p className="text-xs mt-1 text-gray-300">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="Or paste an image URL (https://...)"
                className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-500"
              />
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Margherita"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Category *
                  </label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Classic, Premium…"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe the pizza ingredients..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Sizes & Prices *
                </label>
                <div className="space-y-1.5">
                  {form.sizes.map((size, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={size.name}
                        onChange={(e) => updateSize(i, "name", e.target.value)}
                        placeholder="Name"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      />
                      <span className="text-gray-400 text-sm shrink-0">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={size.price || ""}
                        onChange={(e) => updateSize(i, "price", e.target.value)}
                        placeholder="0.00"
                        className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => removeSize(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove size"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSize}
                    className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1 mt-1 transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Size
                  </button>
                </div>
              </div>

              {/* Toppings */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Extra Toppings{" "}
                  <span className="font-normal text-gray-400">(+$1.50 each, optional)</span>
                </label>
                {form.toppings.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.toppings.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
                      >
                        {t}
                        <button
                          onClick={() => removeTopping(t)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={toppingInput}
                    onChange={(e) => setToppingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTopping();
                      }
                    }}
                    placeholder="e.g. Extra Cheese — press Enter to add"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={addTopping}
                    className="px-3 py-1.5 bg-gray-100 text-dark text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Pizza" : "Add Pizza"}
            </button>
            <button
              onClick={closeForm}
              className="px-6 py-2.5 bg-gray-100 text-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Pizza list ── */}
      <div className="grid gap-3">
        {pizzas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            No pizzas yet. Click &quot;Add Pizza&quot; to get started.
          </div>
        ) : (
          pizzas.map((pizza) => (
            <div
              key={pizza._id}
              className={cn(
                "bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-opacity",
                !pizza.isAvailable && "opacity-60"
              )}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {pizza.image ? (
                  <Image
                    src={pizza.image}
                    alt={pizza.name}
                    fill
                    className="object-cover"
                    unoptimized={pizza.image.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-dark">{pizza.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {pizza.category}
                  </span>
                  {!pizza.isAvailable && (
                    <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {pizza.description}
                </p>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  From {formatPrice(Math.min(...pizza.sizes.map((s) => s.price)))}
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    · {pizza.sizes.length} size{pizza.sizes.length !== 1 ? "s" : ""}
                    {pizza.toppings.length > 0 && ` · ${pizza.toppings.length} topping${pizza.toppings.length !== 1 ? "s" : ""}`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleAvailability(pizza)}
                  title={pizza.isAvailable ? "Hide from menu" : "Show on menu"}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    pizza.isAvailable
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  )}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEdit(pizza)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deletePizza(pizza._id)}
                  disabled={deletingId === pizza._id}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
