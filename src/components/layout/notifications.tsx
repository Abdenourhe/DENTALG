"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.ok) setNotifications(data.notifications);
    } catch {
      // ignore
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="font-semibold text-slate-900">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  Aucune notification.
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border-b px-4 py-3 last:border-0 ${
                    !n.isRead ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => markAsRead(n.id)}
                          className="block"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                            {n.content}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-900">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                            {n.content}
                          </p>
                        </>
                      )}
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          locale: fr,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        title="Marquer comme lu"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
