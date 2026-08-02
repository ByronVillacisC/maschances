"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = (notifications ?? []).filter((n: any) => !n?.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res?.data?.notifications ?? res?.data?.items ?? res?.data ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev: any) =>
        (prev ?? []).map((n: any) => (n?.id === id ? { ...(n ?? {}), read: true } : n))
      );
    } catch { /* ignore */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev: any) =>
        (prev ?? []).map((n: any) => ({ ...(n ?? {}), read: true }))
      );
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, 30000);
    } else {
      setNotifications([]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

export default NotificationContext;
