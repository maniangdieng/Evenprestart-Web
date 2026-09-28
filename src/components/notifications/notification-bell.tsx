"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import type { Socket } from "socket.io-client";
import type { NotificationDto } from "@/lib/api";
import { createRealtimeSocket } from "@/lib/realtime";
import { getRealtimeTokenAction } from "@/lib/realtime-actions";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications-actions";
import { NOTIFICATION_ICON } from "@/lib/notification-display";
import { timeAgo } from "@/lib/time-ago";

interface NotificationBellProps {
  initialNotifications: NotificationDto[];
  initialUnreadCount: number;
  variant?: "light" | "dark";
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
  variant = "light",
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRealtimeTokenAction().then((token) => {
      if (!token || cancelled) return;
      const socket = createRealtimeSocket(token);
      socket.on("notification", (notification: NotificationDto) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 50));
        setUnreadCount((count) => count + 1);
      });
      socketRef.current = socket;
    });
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    await markNotificationReadAction(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  }

  function handleToggle() {
    const opening = !open;
    setOpen(opening);
    if (opening && unreadCount > 0) {
      handleMarkAllRead();
    }
  }

  const buttonTone =
    variant === "dark"
      ? "border-white/15 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
      : "border-navy/15 text-navy/70 hover:border-navy/30 hover:bg-white hover:text-navy";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-transparent transition-colors ${buttonTone}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl shadow-navy/10 sm:w-96">
          <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3">
            <h3 className="font-display text-sm font-bold text-navy">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy/60 hover:text-navy"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell className="h-7 w-7 text-navy/20" />
                <p className="text-sm text-muted">Aucune notification pour le moment.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = NOTIFICATION_ICON[notification.type] ?? Bell;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                    className={`flex w-full items-start gap-3 border-b border-navy/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-navy/[0.03] ${
                      notification.isRead ? "" : "bg-lime/5"
                    }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-navy">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-navy/60">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>
                    {notification.isRead && (
                      <Check className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-navy/20" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
