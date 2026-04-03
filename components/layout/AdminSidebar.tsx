"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Pizza, LayoutDashboard, ClipboardList, UtensilsCrossed, X, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders",    icon: ClipboardList },
  { href: "/admin/menu",   label: "Menu",      icon: UtensilsCrossed },
  { href: "/admin/combos", label: "Combos",    icon: Gift },
];

interface AdminSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AdminSidebar({ open, setOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Pizza className="h-7 w-7 text-primary" />
          <div>
            <span className="font-bold text-lg">Pizzaro</span>
            <span className="block text-xs text-gray-400">Admin Panel</span>
          </div>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                active
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back to Site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-dark text-white flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile: backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile: slide-in sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-72 bg-dark text-white flex flex-col z-50 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
