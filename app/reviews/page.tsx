"use client";

import { useEffect, useState } from "react";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-bg min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              হোম পেজে ফিরে যান (Back to Home)
            </Link>
            <h1 className="text-3xl font-black text-dark tracking-tight md:text-4xl">
              Customer Reviews
            </h1>
            <p className="text-muted-fg mt-2">
              See what our community has to say about Pizzaro!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-dark">{reviews.length} Reviews</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
            No reviews found yet. Be the first to leave one after your order!
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 break-inside-avoid"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white font-bold flex items-center justify-center shrink-0">
                    {r.guestName?.substring(0, 2).toUpperCase() || "AN"}
                  </div>
                  <div>
                    <p className="font-bold text-dark leading-none">
                      {r.guestName || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-fg mt-1">Verified Buyer</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(r.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  {[...Array(5 - r.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-gray-200 fill-gray-200"
                    />
                  ))}
                </div>

                {r.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    "{r.comment}"
                  </p>
                )}

                {r.image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mt-4 border border-gray-100">
                    <Image
                      src={r.image}
                      alt="Review"
                      fill
                      className="object-cover"
                      unoptimized={r.image.startsWith("/uploads/")}
                    />
                  </div>
                )}
                
                <p className="text-[10px] text-gray-400 mt-4 text-right">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
