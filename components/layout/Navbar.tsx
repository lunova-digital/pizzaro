"use client";

import Link from "next/link";
import { useState } from "react";
import { Pizza, ShoppingCart, Menu, X, User, LogOut, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    ...(session ? [{ href: "/orders", label: "My Orders" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-dark">Pizzaro</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {session ? (
              <div className="hidden md:flex items-center gap-3">
                {(session.user as { role?: string })?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors font-medium"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors font-medium"
                >
                  <User className="h-5 w-5" />
                  {session.user?.name?.split(" ")[0]}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-1 text-gray-600 hover:text-primary transition-colors font-medium"
              >
                <User className="h-5 w-5" />
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-3 bg-white">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-gray-600 hover:text-primary font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-gray-600 hover:text-primary font-medium"
                  >
                    Profile
                  </Link>
                  {(session.user as { role?: string })?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 text-gray-600 hover:text-primary font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="block py-2 text-gray-600 hover:text-primary font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-gray-600 hover:text-primary font-medium"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
