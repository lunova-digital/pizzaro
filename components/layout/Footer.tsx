import Link from "next/link";
import { Pizza, MapPin, Phone, Mail, Clock, MessageCircle, Share2, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Pizza className="h-5 w-5 text-white" />
              </div>
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pizzaro
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Handcrafted pizzas made with the finest ingredients. Delivered hot to your door since 2020.
            </p>
            <div className="flex gap-3">
              {[MessageCircle, Share2, Globe].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/menu", label: "Our Menu" },
                { href: "/orders/track", label: "Track Order" },
                { href: "/profile", label: "My Account" },
                { href: "/auth/login", label: "Sign In" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base mb-5">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                123 Pizza Street, New York, NY 10001
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                hello@pizzaro.com
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-bold text-base mb-5">Opening Hours</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-white/80">Mon – Fri</p>
                  <p>11:00 AM – 11:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-white/80">Sat – Sun</p>
                  <p>10:00 AM – 12:00 AM</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Open Now
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Pizzaro. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
