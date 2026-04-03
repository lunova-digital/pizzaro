"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Pizza, ShoppingCart, Menu, X, User, LogOut, Shield, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useSession, signOut } from "next-auth/react";
import { useLang } from "@/contexts/LanguageContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const { data: session } = useSession();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/",             label: t("nav.home") },
    { href: "/menu",         label: t("nav.menu") },
    { href: "/orders/track", label: t("nav.trackOrder") },
    ...(session ? [{ href: "/orders", label: t("nav.myOrders") }] : []),
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-orange-100/60"
          : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-dark transition-colors">
              <Pizza className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pizzaro
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-muted-fg hover:text-primary hover:bg-orange-50 transition-all font-medium text-[15px]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
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

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-muted-fg hover:text-primary hover:bg-orange-50 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {session ? (
              <div className="hidden md:flex items-center gap-1">
                {(session.user as { role?: string })?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-blue-50 transition-all"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface hover:border-primary/30 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-dark">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-fg" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2.5 rounded-xl text-muted-fg hover:text-danger hover:bg-red-50 transition-all"
                  title={t("nav.signOut")}
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-dark hover:text-primary transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-dark hover:bg-orange-50 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden md:hidden border-t border-border"
          >
            <div className="px-4 py-4 space-y-1 bg-white">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-dark hover:text-primary hover:bg-orange-50 font-medium transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border mt-3 space-y-2">
                {/* Mobile language toggle */}
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

                {session ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-dark hover:text-primary hover:bg-orange-50 font-medium"
                    >
                      {t("nav.profile")}
                    </Link>
                    {(session.user as { role?: string })?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-accent hover:bg-blue-50 font-medium"
                      >
                        {t("nav.adminDash")}
                      </Link>
                    )}
                    <button
                      onClick={() => { setMobileOpen(false); signOut(); }}
                      className="block w-full text-left px-3 py-2.5 rounded-xl text-danger hover:bg-red-50 font-medium"
                    >
                      {t("nav.signOut")}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl border border-border text-center font-semibold text-dark"
                    >
                      {t("nav.signIn")}
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl bg-primary text-white text-center font-semibold"
                    >
                      {t("nav.getStarted")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
