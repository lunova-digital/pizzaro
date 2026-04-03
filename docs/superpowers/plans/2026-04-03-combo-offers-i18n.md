# Combo Offers + Bilingual (EN/BN) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 combo offer deals with full admin CRUD, and a persistent EN/বাংলা language toggle to the Pizzaro app.

**Architecture:** Combo is a new Mongoose model with its own API routes following the existing pizza pattern. i18n uses a custom React Context with `localStorage` persistence — no routing changes, no new dependencies. Language state is read from `localStorage` on mount and written on toggle, so it survives page reloads.

**Tech Stack:** Next.js 15 App Router, Mongoose, Tailwind v4, Zustand, Framer Motion, React Context API

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `models/Combo.ts` | Mongoose schema for combo deals |
| Create | `app/api/combos/route.ts` | GET (public) + POST (admin) |
| Create | `app/api/combos/[id]/route.ts` | GET/PUT/DELETE (admin) |
| Create | `lib/translations.ts` | All EN + BN string keys |
| Create | `contexts/LanguageContext.tsx` | Provider + `useLang()` hook |
| Create | `components/menu/ComboCard.tsx` | Single combo display + add-to-cart |
| Create | `components/menu/ComboSection.tsx` | Fetches + renders all combos |
| Create | `app/admin/combos/page.tsx` | Admin CRUD for combos |
| Modify | `seed/index.ts` | Add 3 combos to seed data |
| Modify | `store/cartStore.ts` | Add `type` + `comboId` to CartItem |
| Modify | `components/layout/AdminSidebar.tsx` | Add Combos nav link |
| Modify | `app/layout.tsx` | Wrap with `<LanguageProvider>` |
| Modify | `components/layout/Navbar.tsx` | Add EN/বাং pill + translate labels |
| Modify | `components/menu/PizzaCard.tsx` | Use `t("menu.customizeOrder")` |
| Modify | `components/layout/Footer.tsx` | Use `t()` for footer strings |
| Modify | `app/menu/page.tsx` | Add `<ComboSection />` + `t()` labels |

> **Execution order note:** Tasks 1–4 are independent. Tasks 5–6 (`lib/translations.ts` and `contexts/LanguageContext.tsx`) MUST be completed before Tasks 7–8 (ComboCard, ComboSection) since those components import `useLang`.

---

### Task 1: Combo Mongoose model

**Files:**
- Create: `models/Combo.ts`

- [ ] **Create `models/Combo.ts`**

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ICombo extends Document {
  name: string;
  description: string;
  items: string[];
  price: number;
  image: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComboSchema = new Schema<ICombo>(
  {
    name:        { type: String, required: true },
    description: { type: String, required: true },
    items:       [{ type: String }],
    price:       { type: Number, required: true },
    image:       { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Combo ||
  mongoose.model<ICombo>("Combo", ComboSchema);
```

- [ ] **Commit**
```bash
git add models/Combo.ts
git commit -m "feat: add Combo mongoose model"
```

---

### Task 2: Combo API routes

**Files:**
- Create: `app/api/combos/route.ts`
- Create: `app/api/combos/[id]/route.ts`

- [ ] **Create `app/api/combos/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Combo from "@/models/Combo";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  if (all === "true") {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === "admin";
    if (isAdmin) {
      const combos = await Combo.find({}).sort({ createdAt: -1 });
      return Response.json(combos);
    }
  }

  const combos = await Combo.find({ isAvailable: true }).sort({ createdAt: 1 });
  return Response.json(combos);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const combo = await Combo.create(body);
  return Response.json(combo, { status: 201 });
}
```

- [ ] **Create `app/api/combos/[id]/route.ts`**

```typescript
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Combo from "@/models/Combo";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "admin";
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/combos/[id]">
) {
  await dbConnect();
  const { id } = await ctx.params;
  const combo = await Combo.findById(id);
  if (!combo) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(combo);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/combos/[id]">
) {
  await dbConnect();
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await request.json();
  const combo = await Combo.findByIdAndUpdate(id, body, { new: true });
  if (!combo) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(combo);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/combos/[id]">
) {
  await dbConnect();
  if (!(await requireAdmin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await Combo.findByIdAndDelete(id);
  return Response.json({ success: true });
}
```

- [ ] **Commit**
```bash
git add app/api/combos/
git commit -m "feat: add combo API routes (GET/POST/PUT/DELETE)"
```

---

### Task 3: Seed the 3 combos

**Files:**
- Modify: `seed/index.ts`

- [ ] **Add Combo import and combo seed data to `seed/index.ts`**

Add after the existing imports at the top:
```typescript
import Combo from "../models/Combo";
```

Add the combos array after the `pizzas` array:
```typescript
const combos = [
  {
    name: "Pizza Combo",
    description: "4 classic pizzas + cold drinks — perfect for groups",
    items: [
      "BBQ Chicken Pizza",
      "Margarita Pizza",
      "Masala Sausage Pizza",
      "Meatball Special Pizza",
      "4 Cold Drinks & Wages",
    ],
    price: 999,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
  },
  {
    name: "Meatbox Pizza Combo",
    description: "BBQ chicken pizza with meatbox, fries & drinks",
    items: [
      "BBQ Chicken Pizza 8\"",
      "Meatbox 2pis",
      "French Fries",
      "Cold Drinks 2pis",
    ],
    price: 749,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  },
  {
    name: "Burger Pizza Combo",
    description: "Spicy chicken pizza with burgers, fries & drinks",
    items: [
      "Spicy Chicken Pizza 8\"",
      "French Fries",
      "Chicken Burger 3pis",
      "Cold Drinks 3pis",
    ],
    price: 499,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
  },
];
```

Inside the `seed()` function, in the `FORCE_RESEED` block add `Combo.deleteMany({})`, and after `Pizza.insertMany(pizzas)` add:
```typescript
    if (process.env.FORCE_RESEED === "true") {
      await Combo.deleteMany({});
    }
    // ...existing pizza/category seeding...
    await Combo.insertMany(combos);
    console.log(`Seeded ${combos.length} combos`);
```

- [ ] **Run seed with FORCE_RESEED**
```bash
FORCE_RESEED=true MONGODB_URI="mongodb://admin:yourpassword@localhost:27017/pizzaro?authSource=admin" npx tsx seed/index.ts
```
Expected output:
```
Connected to MongoDB
FORCE_RESEED=true — clearing existing data...
Cleared existing pizzas and categories
Seeded 3 categories
Seeded 14 pizzas
Seeded 3 combos
Seed completed successfully!
```

- [ ] **Commit**
```bash
git add seed/index.ts
git commit -m "feat: add 3 Street Chattola combo deals to seed"
```

---

### Task 4: Extend cart store for combos

**Files:**
- Modify: `store/cartStore.ts`

- [ ] **Add `type` and `comboId` to `CartItem` interface**

Replace the `CartItem` interface (lines 6–15):
```typescript
export interface CartItem {
  id: string;
  pizzaId: string;       // holds comboId when type === "combo"
  comboId?: string;
  type?: "pizza" | "combo";
  name: string;
  size: string;
  price: number;
  quantity: number;
  toppings: string[];
  image: string;
}
```

No other logic changes needed — `totalPrice()` and `totalItems()` work unchanged.

- [ ] **Commit**
```bash
git add store/cartStore.ts
git commit -m "feat: extend CartItem with optional type and comboId fields"
```

---

### Task 7: ComboCard component

**Files:**
- Create: `components/menu/ComboCard.tsx`

- [ ] **Create `components/menu/ComboCard.tsx`**

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useLang } from "@/contexts/LanguageContext";

interface ComboCardProps {
  combo: {
    _id: string;
    name: string;
    description: string;
    items: string[];
    price: number;
    image: string;
  };
}

export default function ComboCard({ combo }: ComboCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useLang();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      pizzaId: combo._id,
      comboId: combo._id,
      type: "combo",
      name: combo.name,
      size: "",
      price: combo.price,
      quantity: 1,
      toppings: [],
      image: combo.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-dark text-white rounded-3xl overflow-hidden shadow-lg group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={combo.image}
          alt={combo.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={combo.image.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Tag className="h-3 w-3" />
          COMBO
        </span>
        <span className="absolute bottom-3 right-3 bg-primary font-bold text-lg px-4 py-1 rounded-2xl shadow-lg">
          ৳{combo.price}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-base mb-1 leading-snug">{combo.name}</h3>
        <ul className="space-y-1 mb-4 flex-1">
          {combo.items.map((item, i) => (
            <li key={i} className="text-white/70 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            added
              ? "bg-success text-white"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {added ? "✓ Added!" : t("combo.addToCart")}
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Commit**
```bash
git add components/menu/ComboCard.tsx
git commit -m "feat: ComboCard component with add-to-cart"
```

---

### Task 8: ComboSection component

**Files:**
- Create: `components/menu/ComboSection.tsx`

- [ ] **Create `components/menu/ComboSection.tsx`**

```tsx
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
```

- [ ] **Commit**
```bash
git add components/menu/ComboSection.tsx
git commit -m "feat: ComboSection fetches and renders combo deals"
```

---

### Task 9: Wire ComboSection into menu page

**Files:**
- Modify: `app/menu/page.tsx`

- [ ] **Add `<ComboSection />` between hero banner and category filter in `app/menu/page.tsx`**

Add import at the top:
```typescript
import ComboSection from "@/components/menu/ComboSection";
```

In the JSX, add `<ComboSection />` after the closing `</div>` of the hero banner and before the category filter `<div className="flex justify-center mb-8">`:
```tsx
        {/* ── Combo Offers ────────────────────────────────── */}
        <ComboSection />

        {/* ── Category filter ─────────────────────────────── */}
```

- [ ] **Commit**
```bash
git add app/menu/page.tsx
git commit -m "feat: add ComboSection to menu page above pizza grid"
```

---

### Task 10: Admin combos page

**Files:**
- Create: `app/admin/combos/page.tsx`

- [ ] **Create `app/admin/combos/page.tsx`**

```tsx
"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import FileDropzone from "@/components/FileIDropzone";

interface Combo {
  _id: string;
  name: string;
  description: string;
  items: string[];
  price: number;
  image: string;
  isAvailable: boolean;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  itemsText: "",   // textarea value — split on save
  price: 0,
  image: "",
  isAvailable: true,
};

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/combos?all=true")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCombos(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(combo: Combo) {
    setForm({
      name: combo.name,
      description: combo.description,
      itemsText: combo.items.join("\n"),
      price: combo.price,
      image: combo.image,
      isAvailable: combo.isAvailable,
    });
    setEditingId(combo._id);
    setError("");
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

  async function handleSave() {
    setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    if (!form.image) { setError("Image is required"); return; }
    if (form.price <= 0) { setError("Price must be greater than 0"); return; }
    const items = form.itemsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) { setError("Add at least one item"); return; }

    setSaving(true);
    try {
      const url = editingId ? `/api/combos/${editingId}` : "/api/combos";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          items,
          price: form.price,
          image: form.image.trim(),
          isAvailable: form.isAvailable,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }
      const saved: Combo = await res.json();
      if (editingId) {
        setCombos((prev) => prev.map((c) => (c._id === saved._id ? saved : c)));
      } else {
        setCombos((prev) => [saved, ...prev]);
      }
      closeForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save combo");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this combo?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/combos/${id}`, { method: "DELETE" });
      setCombos((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleAvailable(combo: Combo) {
    const res = await fetch(`/api/combos/${combo._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !combo.isAvailable }),
    });
    if (res.ok) {
      const updated: Combo = await res.json();
      setCombos((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Combo Offers</h1>
          <p className="text-muted-fg text-sm mt-1">{combos.length} combo{combos.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Combo
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-16 text-muted-fg">
          <p className="text-xl font-bold text-dark">No combos yet</p>
          <p className="mt-1 text-sm">Click "Add Combo" to create your first deal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {combos.map((combo) => (
            <div
              key={combo._id}
              className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Image */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={combo.image}
                  alt={combo.name}
                  fill
                  className="object-cover"
                  unoptimized={combo.image.startsWith("/uploads/")}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark truncate">{combo.name}</span>
                  <span className="text-primary font-bold text-sm">{formatPrice(combo.price)}</span>
                </div>
                <p className="text-xs text-muted-fg mt-0.5 truncate">
                  {combo.items.join(" · ")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleAvailable(combo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    combo.isAvailable
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {combo.isAvailable ? "Live" : "Hidden"}
                </button>
                <button
                  onClick={() => openEdit(combo)}
                  className="p-2 text-muted-fg hover:text-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(combo._id)}
                  disabled={deletingId === combo._id}
                  className="p-2 text-muted-fg hover:text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-dark">
                {editingId ? "Edit Combo" : "Add Combo"}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer">
                <X className="h-5 w-5 text-muted-fg" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pizza Combo"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short tagline shown on the combo card"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Items <span className="font-normal text-muted-fg">(one per line)</span>
                </label>
                <textarea
                  value={form.itemsText}
                  onChange={(e) => setForm((f) => ({ ...f, itemsText: e.target.value }))}
                  rows={5}
                  placeholder={"BBQ Chicken Pizza\nFrench Fries\nCold Drinks 2pis"}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Price (৳)</label>
                <input
                  type="number"
                  min={1}
                  value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g. 999"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Image</label>
                <FileDropzone uploadImage={uploadImage} image={form.image} />
                {uploading && <p className="text-xs text-muted-fg mt-1">Uploading...</p>}
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="Or paste image URL"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mt-2"
                />
                {form.image && (
                  <div className="relative w-full h-32 mt-2 rounded-xl overflow-hidden border border-border">
                    <Image src={form.image} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    form.isAvailable ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isAvailable ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-dark">
                  {form.isAvailable ? "Visible to customers" : "Hidden from menu"}
                </span>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 py-3 border border-border rounded-xl font-semibold text-dark hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingId ? "Save Changes" : "Create Combo"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Commit**
```bash
git add app/admin/combos/page.tsx
git commit -m "feat: admin combos CRUD page"
```

---

### Task 11: Add Combos link to admin sidebar

**Files:**
- Modify: `components/layout/AdminSidebar.tsx`

- [ ] **Add Gift import and Combos link**

Replace the imports line (line 5):
```typescript
import { Pizza, LayoutDashboard, ClipboardList, UtensilsCrossed, X, Gift } from "lucide-react";
```

Replace the `links` array (lines 9–13):
```typescript
const links = [
  { href: "/admin",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders",    icon: ClipboardList },
  { href: "/admin/menu",   label: "Menu",      icon: UtensilsCrossed },
  { href: "/admin/combos", label: "Combos",    icon: Gift },
];
```

- [ ] **Commit**
```bash
git add components/layout/AdminSidebar.tsx
git commit -m "feat: add Combos link to admin sidebar"
```

---

### Task 5: Translation file

**Files:**
- Create: `lib/translations.ts`

- [ ] **Create `lib/translations.ts`**

```typescript
export type Lang = "en" | "bn";

export const translations = {
  en: {
    nav: {
      home:       "Home",
      menu:       "Menu",
      trackOrder: "Track Order",
      myOrders:   "My Orders",
      signIn:     "Sign In",
      getStarted: "Get Started",
      profile:    "Profile",
      adminDash:  "Admin Dashboard",
      signOut:    "Sign Out",
    },
    menu: {
      title:             "Our Menu",
      subtitle:          "Handcrafted with love · Street Chattola style",
      searchPlaceholder: "Search pizzas...",
      customizeOrder:    "Customize & Order",
      noPizzas:          "No pizzas found",
      noPizzasHint:      "Try a different category or search term",
      items:             "items",
      item:              "item",
      in:                "in",
      matching:          "matching",
    },
    combo: {
      sectionTitle: "Combo Offers",
      addToCart:    "Add to Cart",
    },
    footer: {
      tagline:      "Handcrafted pizzas made with the finest ingredients. Delivered hot to your door since 2020.",
      quickLinks:   "Quick Links",
      contact:      "Contact Us",
      hours:        "Opening Hours",
      rights:       "All rights reserved.",
      privacy:      "Privacy Policy",
      terms:        "Terms of Service",
      monFri:       "Mon – Fri",
      satSun:       "Sat – Sun",
      openNow:      "Open Now",
    },
  },
  bn: {
    nav: {
      home:       "হোম",
      menu:       "মেনু",
      trackOrder: "অর্ডার ট্র্যাক",
      myOrders:   "আমার অর্ডার",
      signIn:     "সাইন ইন",
      getStarted: "শুরু করুন",
      profile:    "প্রোফাইল",
      adminDash:  "অ্যাডমিন ড্যাশবোর্ড",
      signOut:    "সাইন আউট",
    },
    menu: {
      title:             "আমাদের মেনু",
      subtitle:          "ভালোবাসায় তৈরি · স্ট্রিট চাত্তোলা স্টাইল",
      searchPlaceholder: "পিৎজা খুঁজুন...",
      customizeOrder:    "কাস্টমাইজ ও অর্ডার",
      noPizzas:          "কোনো পিৎজা পাওয়া যায়নি",
      noPizzasHint:      "অন্য ক্যাটাগরি বা সার্চ শব্দ ব্যবহার করুন",
      items:             "টি আইটেম",
      item:              "টি আইটেম",
      in:                "এ",
      matching:          "মিলেছে",
    },
    combo: {
      sectionTitle: "কম্বো অফার",
      addToCart:    "কার্টে যোগ করুন",
    },
    footer: {
      tagline:      "সেরা উপাদান দিয়ে তৈরি পিৎজা। ২০২০ সাল থেকে গরম গরম পৌঁছে দিচ্ছি।",
      quickLinks:   "দ্রুত লিংক",
      contact:      "যোগাযোগ করুন",
      hours:        "খোলার সময়",
      rights:       "সর্বস্বত্ব সংরক্ষিত।",
      privacy:      "গোপনীয়তা নীতি",
      terms:        "সেবার শর্তাবলী",
      monFri:       "সোম – শুক্র",
      satSun:       "শনি – রবি",
      openNow:      "এখন খোলা",
    },
  },
} as const;
```

- [ ] **Commit**
```bash
git add lib/translations.ts
git commit -m "feat: EN/BN translation strings"
```

---

### Task 6: Language context

**Files:**
- Create: `contexts/LanguageContext.tsx`

- [ ] **Create `contexts/LanguageContext.tsx`**

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations, Lang } from "@/lib/translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (path) => path,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "bn") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem("lang", l);
    setLangState(l);
  }

  function t(path: string): string {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return typeof val === "string" ? val : path;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
```

- [ ] **Commit**
```bash
git add contexts/LanguageContext.tsx
git commit -m "feat: LanguageContext with localStorage persistence"
```

---

### Task 12: Wire LanguageProvider into root layout  <!-- after Task 6 -->

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Add LanguageProvider import and wrap children**

Add import after the existing `SessionProvider` import:
```typescript
import { LanguageProvider } from "@/contexts/LanguageContext";
```

In the `<body>`, wrap the content so `LanguageProvider` is inside `SessionProvider`:
```tsx
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
```

- [ ] **Commit**
```bash
git add app/layout.tsx
git commit -m "feat: wrap app with LanguageProvider"
```

---

### Task 13: Language pill in Navbar + translate nav labels  <!-- after Task 12 -->

**Files:**
- Modify: `components/layout/Navbar.tsx`

- [ ] **Add `useLang` import and language pill**

Add import at top of `Navbar.tsx` (after existing imports):
```typescript
import { useLang } from "@/contexts/LanguageContext";
```

Inside the `Navbar` function, add after the `useSession` line:
```typescript
  const { lang, setLang, t } = useLang();
```

Replace the `links` array to use `t()`:
```typescript
  const links = [
    { href: "/",            label: t("nav.home") },
    { href: "/menu",        label: t("nav.menu") },
    { href: "/orders/track",label: t("nav.trackOrder") },
    ...(session ? [{ href: "/orders", label: t("nav.myOrders") }] : []),
  ];
```

In the **right actions** `<div className="flex items-center gap-2">`, add the language pill **before** the cart link:
```tsx
            {/* Language toggle */}
            <div className="flex items-center bg-orange-50 rounded-full p-0.5 border border-border">
              {(["en", "bn"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                    lang === l
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-fg hover:text-dark"
                  }`}
                >
                  {l === "en" ? "EN" : "বাং"}
                </button>
              ))}
            </div>
```

Replace the desktop auth labels to use `t()`:
- `"Sign In"` → `{t("nav.signIn")}`
- `"Get Started"` → `{t("nav.getStarted")}`
- `"Admin Dashboard"` → `{t("nav.adminDash")}`
- `"Profile"` in mobile → `{t("nav.profile")}`
- `"Sign Out"` → `{t("nav.signOut")}`

Also add the language pill to the mobile menu (inside the `<div className="pt-3 border-t border-border mt-3 space-y-2">`):
```tsx
              <div className="flex items-center bg-orange-50 rounded-full p-0.5 border border-border w-fit">
                {(["en", "bn"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      lang === l ? "bg-primary text-white shadow-sm" : "text-muted-fg"
                    }`}
                  >
                    {l === "en" ? "EN" : "বাং"}
                  </button>
                ))}
              </div>
```

- [ ] **Commit**
```bash
git add components/layout/Navbar.tsx
git commit -m "feat: EN/BN language pill in navbar with translated labels"
```

---

### Task 14: Wire t() into remaining components  <!-- after Task 13 -->

**Files:**
- Modify: `components/menu/PizzaCard.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `app/menu/page.tsx`

- [ ] **Update `PizzaCard.tsx`** — add `useLang` import and replace the hardcoded CTA

Add import:
```typescript
import { useLang } from "@/contexts/LanguageContext";
```

Inside `PizzaCard`, add:
```typescript
  const { t } = useLang();
```

Replace the button text:
```tsx
          {t("menu.customizeOrder")}
```

- [ ] **Update `Footer.tsx`** — make it a client component with translations

Add `"use client";` at the very top.

Add import:
```typescript
import { useLang } from "@/contexts/LanguageContext";
```

Inside `Footer`, add:
```typescript
  const { t } = useLang();
```

Replace hardcoded strings:
- `"Handcrafted pizzas made with..."` → `{t("footer.tagline")}`
- `"Quick Links"` → `{t("footer.quickLinks")}`
- `"Contact Us"` (heading) → `{t("footer.contact")}`
- `"Opening Hours"` → `{t("footer.hours")}`
- `"Mon – Fri"` → `{t("footer.monFri")}`
- `"Sat – Sun"` → `{t("footer.satSun")}`
- `"Open Now"` → `{t("footer.openNow")}`
- `"All rights reserved."` → `{t("footer.rights")}`
- `"Privacy Policy"` → `{t("footer.privacy")}`
- `"Terms of Service"` → `{t("footer.terms")}`

- [ ] **Update `app/menu/page.tsx`** — translate hero + labels

Add imports:
```typescript
import { useLang } from "@/contexts/LanguageContext";
```

Inside `MenuPage`, add:
```typescript
  const { t } = useLang();
```

Replace:
- `"Our Menu"` → `{t("menu.title")}`
- `"Handcrafted with love · Street Chattola style"` → `{t("menu.subtitle")}`
- `placeholder="Search pizzas..."` → `placeholder={t("menu.searchPlaceholder")}`
- `"No pizzas found"` → `{t("menu.noPizzas")}`
- `"Try a different category or search term"` → `{t("menu.noPizzasHint")}`

Replace the results count line:
```tsx
          {filtered.length} {filtered.length !== 1 ? t("menu.items") : t("menu.item")}
          {selected !== "All" ? ` ${t("menu.in")} ${selected}` : ""}
          {search ? ` ${t("menu.matching")} "${search}"` : ""}
```

- [ ] **Commit**
```bash
git add components/menu/PizzaCard.tsx components/layout/Footer.tsx app/menu/page.tsx
git commit -m "feat: wire t() translations into PizzaCard, Footer, and menu page"
```

---

### Task 15: Deploy

- [ ] **Build and deploy**
```bash
docker compose build app && docker compose up -d app
```

- [ ] **Verify app is up**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8336
```
Expected: `200`

- [ ] **Manual smoke checks**
  1. Open `http://localhost:8336/menu` — confirm 3 combo cards appear above category filter
  2. Click "Add to Cart" on a combo — confirm item appears in cart
  3. Click "বাং" pill in navbar — confirm page text switches to Bangla
  4. Reload the page — confirm Bangla is still active (localStorage persistence)
  5. Click "EN" — confirm it switches back to English
  6. Open `http://localhost:8336/admin/combos` (log in as admin first) — confirm combo list with Add/Edit/Delete
  7. Create a new combo — confirm it appears on the menu page

- [ ] **Final commit**
```bash
git add .
git commit -m "deploy: combo offers + EN/BN bilingual support"
```
