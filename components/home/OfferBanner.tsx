"use client";

import { useEffect, useState } from "react";
import { Flame, X } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/contexts/LanguageContext";

interface Offer {
  _id: string;
  title?: string; // from Offer
  title_bn?: string;
  name?: string;  // from Combo
  name_bn?: string;
  type?: "percentage" | "flat" | "combo"; // Offer has this
  discountValue?: number; // Offer has this
  price?: number; // Combo has this
  endsAt?: string; // Offer has this
  offerEndsAt?: string; // Combo has this
  isFeatured: boolean;
}

function getTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, done: diff === 0 };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function OfferBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [tick, setTick] = useState(0);
  const { lang } = useLang();

  useEffect(() => {
    Promise.all([
      fetch("/api/offers?featured=true").then((r) => r.json()),
      fetch("/api/combos?featured=true").then((r) => r.json())
    ]).then(([offersData, combosData]) => {
      const allOffers: Offer[] = [];
      if (Array.isArray(offersData)) allOffers.push(...offersData);
      if (Array.isArray(combosData)) allOffers.push(...combosData);

      // Filter out items without an end date OR already expired, and sort by nearest end date
      const validOffers = allOffers.filter(o => {
        const d = o.endsAt || o.offerEndsAt;
        if (!d) return false;
        return new Date(d).getTime() > Date.now();
      }).sort((a, b) => {
        const d1 = new Date(a.endsAt || a.offerEndsAt || "").getTime();
        const d2 = new Date(b.endsAt || b.offerEndsAt || "").getTime();
        return d1 - d2;
      });

      if (validOffers.length > 0) setOffers(validOffers);
    }).catch(() => {});
  }, []);

  // Tick every second
  useEffect(() => {
    if (offers.length === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [offers]);

  if (dismissed || offers.length === 0) return null;

  // Pick the offer with the soonest expiry
  const offer = offers[0];
  const expiryDate = offer.endsAt || offer.offerEndsAt || "";
  const { h, m, s, done } = getTimeLeft(expiryDate);

  if (done) return null;

  const offerTitle = offer.title || offer.name;
  const offerTitleBn = offer.title_bn || offer.name_bn;
  const titleText = lang === "bn" && offerTitleBn ? offerTitleBn : offerTitle;
  
  let discountText = "";
  if (offer.price !== undefined) {
    discountText = lang === "bn" ? `মাত্র ৳${offer.price}` : `Only ৳${offer.price}`;
  } else if (offer.type === "percentage") {
    discountText = lang === "bn" ? `${offer.discountValue}% ছাড়` : `${offer.discountValue}% OFF`;
  } else {
    discountText = lang === "bn" ? `৳${offer.discountValue} ছাড়` : `৳${offer.discountValue} OFF`;
  }

  return (
    <div className="relative z-40 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white flex items-center justify-center gap-4 sm:gap-6 flex-wrap shadow-xl py-3 px-6 border-b-4 border-yellow-400">
      <span className="flex items-center gap-2 font-black text-lg md:text-2xl uppercase tracking-wider drop-shadow-md">
        <Flame className="h-6 w-6 md:h-8 md:w-8 animate-pulse text-yellow-300" />
        {titleText}
      </span>
      <span className="text-yellow-300 font-black text-lg md:text-2xl drop-shadow-md">
        {discountText}
      </span>
      <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-xl px-4 py-1.5 font-mono font-bold tracking-widest text-xl md:text-2xl shadow-inner border border-white/20">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
      <Link
        href="/#grab-the-deal"
        className="bg-yellow-400 text-red-900 font-extrabold text-sm md:text-base px-6 py-2.5 rounded-full hover:bg-white hover:scale-105 transition-all shadow-lg"
      >
        {lang === "bn" ? "এখনই লুফে নিন!" : "Grab Now!"}
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
