"use client";

import { useEffect, useState } from "react";
import { Flame, X, Clock } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/contexts/LanguageContext";
import Image from "next/image";

interface Offer {
  _id: string;
  title?: string;
  title_bn?: string;
  name?: string;
  name_bn?: string;
  type?: "percentage" | "flat" | "combo";
  discountValue?: number;
  price?: number;
  endsAt?: string;
  offerEndsAt?: string;
  image?: string;
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

export default function OfferPopup() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const { lang, t } = useLang();

  useEffect(() => {
    // Check if we've already shown the popup this session
    if (sessionStorage.getItem("offerPopupSeen")) return;

    // Fetch offers and combos
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

      if (validOffers.length > 0) {
        setOffer(validOffers[0]);
        // Delay popup slightly for a smooth entrance
        setTimeout(() => setOpen(true), 2500);
      }
    }).catch(() => {});
  }, []);

  // Tick every second for the countdown
  useEffect(() => {
    if (!open || !offer) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [open, offer]);

  if (!open || !offer) return null;

  const expiryDate = offer.endsAt || offer.offerEndsAt || "";
  const { h, m, s, done } = getTimeLeft(expiryDate);

  if (done) return null;

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("offerPopupSeen", "true");
  };

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

  // Fallback image if offer has no image
  const imageUrl = offer.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1470&auto=format&fit=crop";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="relative h-56 md:h-64 w-full">
          <Image 
            src={imageUrl} 
            alt={titleText || ""} 
            fill 
            className="object-cover"
            unoptimized={imageUrl.startsWith("/uploads/")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
            <Flame className="w-4 h-4 animate-pulse text-yellow-300" />
            {lang === "bn" ? "সীমিত সময়ের অফার" : "Limited Time Offer"}
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-1 drop-shadow-md text-yellow-400">
              {discountText}
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 text-center bg-gradient-to-b from-white to-orange-50/50">
          <h3 className="text-2xl font-bold text-dark mb-2">{titleText}</h3>
          
          <div className="flex flex-col items-center justify-center mt-6 mb-8">
            <p className="text-sm font-medium text-muted-fg mb-2 uppercase tracking-wide">
              {lang === "bn" ? "অফার শেষ হবে" : "Offer ends in"}
            </p>
            <div className="flex items-center gap-2 font-mono text-3xl font-black border-2 border-red-100 bg-red-50 text-red-600 px-6 py-3 rounded-2xl">
              <Clock className="w-6 h-6 text-red-400 animate-pulse" />
              {pad(h)}:<span className="text-red-500">{pad(m)}</span>:<span className="text-red-400">{pad(s)}</span>
            </div>
          </div>

          <Link
            href="/#grab-the-deal"
            onClick={handleClose}
            className="block w-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-600/20"
          >
            {lang === "bn" ? "এখনই অফারটি নিন!" : "Claim Offer Now!"}
          </Link>
          
          <button 
            onClick={handleClose}
            className="mt-4 text-muted-fg text-sm hover:text-dark underline underline-offset-4 transition-colors"
          >
            {lang === "bn" ? "না, ধন্যবাদ" : "No, thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}
