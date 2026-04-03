"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShoppingCart, Clock } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

interface FeaturedOffer {
  _id: string;
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  type: "percentage" | "flat" | "combo";
  discountValue: number;
  endsAt: string;
  image?: string;
  targetType?: "all" | "category" | "pizza";
  targetId?: string;
}

interface FeaturedCombo {
  _id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  price: number;
  image: string;
  offerEndsAt?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function getCountdown(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function HomeOffers() {
  const [offers, setOffers] = useState<FeaturedOffer[]>([]);
  const [tick, setTick] = useState(0);
  const { t, lang } = useLang();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/offers?featured=true").then(r => r.json()).then(data => { if (Array.isArray(data)) setOffers(data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (offers.length === 0) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [offers]);

  const hasContent = offers.length > 0;
  if (!hasContent) return null;

  function handleOfferClick(offer: FeaturedOffer) {
    if (offer.targetType === "category" && offer.targetId) {
      router.push(`/menu?category=${encodeURIComponent(offer.targetId)}`);
    } else if (offer.targetType === "pizza" && offer.targetId) {
      router.push(`/menu/${offer.targetId}`);
    } else {
      router.push("/menu");
    }
  }

  return (
    <section id="grab-the-deal" className="relative py-16 lg:py-24 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-red-900 to-orange-900" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-yellow-300 font-bold text-sm mb-4 border border-yellow-400/30">
            <Sparkles className="h-4 w-4" />
            {t("homeOffers.badge")}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {t("homeOffers.title")}
          </h2>
          <p className="text-lg text-orange-200">
            {t("homeOffers.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standalone Offers */}
          {offers.map((offer) => (
            <div 
              key={offer._id} 
              onClick={() => handleOfferClick(offer)}
              className="cursor-pointer group bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 hover:border-yellow-400/60 transition-all hover:-translate-y-1 p-6 flex flex-col gap-4"
            >
              {offer.image && (
                <div className="relative h-40 rounded-2xl overflow-hidden">
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {offer.type === "percentage" ? `${offer.discountValue}% OFF` : `৳${offer.discountValue} OFF`}
                  </div>
                </div>
              )}
              {!offer.image && (
                <div className="h-20 flex items-center justify-center">
                  <span className="text-5xl font-black text-yellow-400">
                    {offer.type === "percentage" ? `${offer.discountValue}%` : `৳${offer.discountValue}`}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{lang === "bn" && offer.title_bn ? offer.title_bn : offer.title}</h3>
                <p className="text-orange-200 text-sm mt-1">{lang === "bn" && offer.description_bn ? offer.description_bn : offer.description}</p>
              </div>
              <div className="flex items-center gap-2 text-yellow-300 text-sm font-mono">
                <Clock className="h-4 w-4" />
                <span>{getCountdown(offer.endsAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
