"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  Heart,
  Settings,
  Headset,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

/** Menu de l'espace client (même rendu que l'espace artiste). */
export function ClientSidebar({
  activeBookingsCount,
  supportUnreadCount = 0,
}: {
  activeBookingsCount: number;
  supportUnreadCount?: number;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/client", label: "Vue d'ensemble", icon: LayoutDashboard },
    {
      href: "/client/reservations",
      label: "Réservations",
      icon: CalendarClock,
      count: activeBookingsCount > 0 ? activeBookingsCount : undefined,
    },
    { href: "/client/favoris", label: "Favoris", icon: Heart },
    {
      href: "/client/messages",
      label: "Messagerie",
      icon: Headset,
      count: supportUnreadCount > 0 ? supportUnreadCount : undefined,
    },
    { href: "/client/parametres", label: "Paramètres", icon: Settings },
  ];

  const isActive = (href: string) =>
    href === "/client" ? pathname === "/client" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-60 flex-shrink-0 border-r border-navy/10 bg-white/60 px-3 py-6 overflow-y-auto md:block">
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-navy text-lime shadow-sm"
                    : "text-navy/60 hover:bg-navy/5 hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      active ? "bg-lime/20 text-lime" : "bg-terracotta/15 text-terracotta"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      {/* Barre du bas : élément de la mise en page (pas `fixed`), placée en dernier
          via `order-last` — la zone de contenu s'arrête juste au-dessus. */}
      <nav className="order-last z-40 flex flex-shrink-0 border-t border-navy/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                active ? "text-navy" : "text-navy/40"
              }`}
            >
              <span className="relative">
                <Icon className={`h-5 w-5 ${active ? "text-lime-dark" : ""}`} strokeWidth={active ? 2.5 : 2} />
                {typeof item.count === "number" && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-terracotta text-[8px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate">
                {item.label === "Vue d'ensemble" ? "Accueil" : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
