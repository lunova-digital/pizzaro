"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import FileDropzone from "@/components/FileIDropzone";

interface Combo {
  _id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  items: string[];
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  offerEndsAt?: string;
}

const EMPTY_FORM = {
  name: "",
  name_bn: "",
  description: "",
  description_bn: "",
  itemsText: "",   // textarea value — split on save
  price: 0,
  image: "",
  isAvailable: true,
  isFeatured: false,
  offerEndsAt: "",
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
      name_bn: combo.name_bn || "",
      description: combo.description,
      description_bn: combo.description_bn || "",
      itemsText: combo.items.join("\n"),
      price: combo.price,
      image: combo.image,
      isAvailable: combo.isAvailable,
      isFeatured: combo.isFeatured || false,
      offerEndsAt: combo.offerEndsAt ? new Date(combo.offerEndsAt).toISOString().slice(0, 16) : "",
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
          name_bn: (form.name_bn || "").trim(),
          description: form.description.trim(),
          description_bn: (form.description_bn || "").trim(),
          items,
          price: form.price,
          image: form.image.trim(),
          isAvailable: form.isAvailable,
          isFeatured: form.isFeatured,
          offerEndsAt: form.offerEndsAt ? new Date(form.offerEndsAt).toISOString() : null,
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
          <p className="mt-1 text-sm">Click &quot;Add Combo&quot; to create your first deal</p>
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
                  unoptimized={combo.image?.startsWith("/uploads/")}
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
                <label className="block text-sm font-semibold text-dark mb-1.5">Name (EN)</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pizza Combo"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">🇧🇩 নাম (বাংলা)</label>
                <input
                  value={form.name_bn}
                  onChange={(e) => setForm((f) => ({ ...f, name_bn: e.target.value }))}
                  placeholder="যেমন: পিৎজা কম্বো"
                  className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Description (EN)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short tagline shown on the combo card"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">🇧🇩 বিবরণ (বাংলা)</label>
                <input
                  value={form.description_bn}
                  onChange={(e) => setForm((f) => ({ ...f, description_bn: e.target.value }))}
                  placeholder="যেমন: ৪টি পিৎজা + কোল্ড ড্রিংকস"
                  className="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-primary"
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
                <label className="block text-sm font-semibold text-dark mb-1.5">Offer Ends At (Optional)</label>
                <input
                  type="datetime-local"
                  value={form.offerEndsAt}
                  onChange={(e) => setForm((f) => ({ ...f, offerEndsAt: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-fg mt-1">Leave empty if this is a permanent combo offer.</p>
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

              <div className="flex flex-col gap-3">
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

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      form.isFeatured ? "bg-red-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.isFeatured ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-dark">
                    {form.isFeatured ? "Featured on Homepage" : "Standard Combo"}
                  </span>
                </div>
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
