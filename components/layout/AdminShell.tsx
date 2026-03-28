"use client";

import { useState } from "react";
import { Menu, Pizza } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={open} setOpen={setOpen} />

      <div className="flex-1 min-w-0 lg:ml-64 overflow-x-hidden flex flex-col">
        {/* Mobile top bar — visible below the site Navbar on small screens */}
        <div className="lg:hidden bg-dark text-white flex items-center gap-3 px-4 py-3 shadow-md shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Pizza className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Admin Panel</span>
          </Link>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
