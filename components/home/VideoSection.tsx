"use client";

import { useLang } from "@/contexts/LanguageContext";

export default function VideoSection() {
  const { t } = useLang();

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {t("homeVideo.title")}
          </h2>
          <p className="text-lg text-gray-600">
            {t("homeVideo.subtitle")}
          </p>
        </div>
        
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-dark/5 p-2 sm:p-4 border border-gray-100 max-w-5xl mx-auto group">
            <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-inner bg-black">
                <iframe
                    className="absolute inset-0 w-full h-full rounded-2xl"
                    src="https://www.youtube.com/embed/r9M9LC1V5-g?autoplay=0&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1"
                    title="Pizzaro Masterchef Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
      </div>
    </section>
  );
}
