"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, getRoleLabel } from "@/lib/helpers";
import { LayoutDashboard, Ticket, Trophy, Bell, ShoppingCart, ArrowRight, TrendingUp, Clock, Star, Package } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const { unreadCount } = useNotifications();
  const [stats, setStats] = useState<any>({});
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    api.get("/tickets?limit=5").then((res: any) => {
      const payload = res?.data?.data ?? res?.data;
      const list = payload?.items ?? payload?.tickets ?? payload;
      setRecentTickets(Array.isArray(list) ? list : []);
    }).catch(() => {
      setRecentTickets([]);
    });
    api.get("/users/me/stats").then((res: any) => {
      const payload = res?.data?.data ?? res?.data;
      setStats(payload && typeof payload === "object" ? payload : {});
    }).catch(() => {});
  }, []);

  const safeTickets = Array.isArray(recentTickets) ? recentTickets : [];

  const quickLinks = [
    { href: "/catalog", label: "Ver Sorteos", icon: Trophy, color: "text-amber-500" },
    { href: "/my-tickets", label: "Mis Tickets", icon: Ticket, color: "text-primary" },
    { href: "/cart", label: "Mi Carrito", icon: ShoppingCart, color: "text-green-500" },
    { href: "/notifications", label: "Notificaciones", icon: Bell, color: "text-blue-500", badge: unreadCount },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">¡Hola, {user?.name?.split?.(" ")?.[0] ?? "Usuario"}! 👋</h1>
          <p className="text-muted-foreground">Bienvenido a tu panel de +CHANCES • {getRoleLabel(user?.role)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tickets Activos", value: stats?.activeTickets ?? 0, icon: Ticket, color: "text-primary" },
            { label: "Sorteos Participando", value: stats?.activeRaffles ?? 0, icon: Trophy, color: "text-amber-500" },
            { label: "Premios Ganados", value: stats?.totalWins ?? 0, icon: Star, color: "text-green-500" },
            { label: "Total Invertido", value: formatCurrency(stats?.totalSpent ?? 0), icon: TrendingUp, color: "text-blue-500" },
          ].map((stat: any, i: number) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><stat.icon className={`h-5 w-5 ${stat.color}`} /><span className="text-xs text-muted-foreground">{stat.label}</span></div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {quickLinks.map((link: any) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full"><CardContent className="p-4 flex items-center gap-3">
                <div className="relative">
                  <link.icon className={`h-6 w-6 ${link.color}`} />
                  {(link?.badge ?? 0) > 0 && <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">{link.badge}</span>}
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent></Card>
            </Link>
          ))}
        </div>
        {hasRole(["owner", "admin", "superadmin"]) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link href="/owner/packages">
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-blue-200 dark:border-blue-900"><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><Package className="h-6 w-6 text-blue-500" /><div><p className="font-medium">Gestionar Paquetes</p><p className="text-xs text-muted-foreground">Crear y administrar paquetes</p></div></div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent></Card>
            </Link>
            {hasRole(["admin", "superadmin"]) && (
              <Link href="/admin/users">
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-orange-200 dark:border-orange-900"><CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><LayoutDashboard className="h-6 w-6 text-orange-500" /><div><p className="font-medium">Panel Admin</p><p className="text-xs text-muted-foreground">Gestión y reportes</p></div></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent></Card>
              </Link>
            )}
          </div>
        )}
        <Card>
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Tickets Recientes</CardTitle>
            <Link href="/my-tickets"><Button variant="ghost" size="sm" className="gap-1">Ver Todos <ArrowRight className="h-4 w-4" /></Button></Link>
          </div></CardHeader>
          <CardContent>
            {safeTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aún no tienes tickets. ¡Explora los sorteos!</p>
            ) : (
              <div className="space-y-3">
                {safeTickets.map((ticket: any) => (
                  <div key={ticket?.id ?? Math.random()} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3"><Ticket className="h-5 w-5 text-primary" /><div>
                      <p className="text-sm font-medium">{ticket?.raffleName ?? ticket?.raffle?.name ?? "Sorteo"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateTime(ticket?.createdAt)}</p>
                    </div></div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">#{ticket?.number ?? ticket?.ticketNumber ?? "--"}</p>
                      <Badge variant="outline" className="text-[10px]">{ticket?.status ?? "activo"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
