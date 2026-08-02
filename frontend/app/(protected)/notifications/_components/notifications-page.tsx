"use client";

import React from "react";
import { useNotifications } from "@/lib/notification-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { formatDateTime } from "@/lib/helpers";
import { Bell, BellOff, CheckCheck, Info, AlertTriangle, Trophy, Mail } from "lucide-react";
import { motion } from "framer-motion";

const typeIcons: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  success: Trophy,
  win: Trophy,
  message: Mail,
};

const typeColors: Record<string, string> = {
  info: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  warning: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  success: "text-green-500 bg-green-50 dark:bg-green-900/20",
  win: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  message: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
};

export function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Notificaciones</h1>
            <p className="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leídas"}</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
            </Button>
          )}
        </div>
        {(notifications ?? []).length === 0 ? (
          <EmptyState icon={BellOff} title="Sin notificaciones" description="No tienes notificaciones por el momento." />
        ) : (
          <div className="space-y-3">
            {(notifications ?? []).map((n: any, i: number) => {
              const Icon = typeIcons[n?.type ?? ""] ?? Bell;
              const colorClass = typeColors[n?.type ?? ""] ?? "text-gray-500 bg-gray-50 dark:bg-gray-900/20";
              return (
                <motion.div key={n?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className={`transition-all ${!n?.read ? "border-primary/30 shadow-sm" : "opacity-80"}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm font-medium ${!n?.read ? "font-semibold" : ""}`}>{n?.title ?? "Notificación"}</h3>
                            {!n?.read && <Badge className="bg-primary text-primary-foreground text-[10px]">Nueva</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{n?.message ?? ""}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n?.createdAt)}</p>
                        </div>
                        {!n?.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(n?.id)} className="text-xs self-start">
                            Leída
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
