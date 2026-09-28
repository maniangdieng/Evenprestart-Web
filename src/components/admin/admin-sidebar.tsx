"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Tags,
  Users,
  CalendarClock,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export function AdminSidebar({
  pendingProfilesCount,
  messagesUnreadCount = 0,
}: {
  pendingProfilesCount: number;
  messagesUnreadCount?: number;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
    {
      href: "/admin/profils",
      label: "Profils à valider",
      icon: UserCheck,
      count: pendingProfilesCount > 0 ? pendingProfilesCount : undefined,
    },
    {
      href: "/admin/messagerie",
      label: "Messagerie",
      icon: MessageCircle,
      count: messagesUnreadCount > 0 ? messagesUnreadCount : undefined,
    },
    { href: "/admin/categories", label: "Catégories", icon: Tags },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
    { href: "/admin/reservations", label: "Réservations", icon: CalendarClock },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
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

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-navy/10 bg-white/95 backdrop-blur md:hidden">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
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
              {item.label === "Vue d'ensemble" ? "Accueil" : item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
