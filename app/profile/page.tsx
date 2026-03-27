"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, MapPin, Plus, Trash2, Save } from "lucide-react";

interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  label?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setPhone(data.phone || "");
          setAddresses(data.addresses || []);
        })
        .catch(() => {});
    }
  }, [session]);

  function addAddress() {
    setAddresses([
      ...addresses,
      { street: "", city: "", state: "", zipCode: "", label: "" },
    ]);
  }

  function removeAddress(index: number) {
    setAddresses(addresses.filter((_, i) => i !== index));
  }

  function updateAddress(index: number, field: keyof Address, value: string) {
    setAddresses(
      addresses.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, addresses }),
      });
      if (res.ok) setMessage("Profile saved!");
      else setMessage("Failed to save");
    } catch {
      setMessage("Failed to save");
    }
    setSaving(false);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-dark mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-dark">{session.user?.name}</h2>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Saved Addresses
            </h2>
            <button
              onClick={addAddress}
              className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-gray-400 text-sm">No saved addresses yet.</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Label (e.g. Home, Work)"
                      value={addr.label || ""}
                      onChange={(e) =>
                        updateAddress(i, "label", e.target.value)
                      }
                      className="text-sm font-semibold text-dark bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => removeAddress(i)}
                      className="text-gray-300 hover:text-primary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addr.street}
                    onChange={(e) =>
                      updateAddress(i, "street", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={addr.city}
                      onChange={(e) =>
                        updateAddress(i, "city", e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addr.state}
                      onChange={(e) =>
                        updateAddress(i, "state", e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={addr.zipCode}
                      onChange={(e) =>
                        updateAddress(i, "zipCode", e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {message && (
            <span
              className={`text-sm font-medium ${message.includes("saved") ? "text-accent" : "text-red-500"}`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
