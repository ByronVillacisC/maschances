"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/helpers";
import { Ticket, Trophy, Clock, Loader2, Filter } from "lucide-react";
import { motion } from "framer-motion";

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTickets = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) setLoading(true); else setLoadingMore(true);
      const params: any = { limit: 20 };
      if (filter !== "all") params.status = filter;
      if (!reset && cursor) params.cursor = cursor;
      const res = await api.get("/tickets", { params });
      const data = res?.data;
      const items = data?.items ?? data?.tickets ?? data ?? [];
      if (reset) setTickets(items); else setTickets((prev: any[]) => [...(prev ?? []), ...items]);
      setCursor(data?.nextCursor ?? null);
      setHasMore(!!data?.nextCursor);
    } catch { if (reset) setTickets([]); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [filter, cursor]);

  useEffect(() => { fetchTickets(true); }, [filter]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div><h1 className="font-display text-3xl font-bold tracking-tight mb-1">Mis Tickets</h1><p className="text-muted-foreground">Todos tus tickets en un solo lugar</p></div>
          <Select value={filter} onValueChange={(v: string) => setFilter(v)}>
            <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="won">Ganadores</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? <LoadingSpinner fullPage /> : (tickets ?? []).length === 0 ? (
          <EmptyState icon={Ticket} title="Sin tickets" description="Aún no has comprado tickets." actionLabel="Ver Sorteos" onAction={() => window.location.href = "/catalog"} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(tickets ?? []).map((ticket: any, i: number) => (
                <motion.div key={ticket?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center"><Ticket className="h-5 w-5 text-white" /></div>
                        <div><p className="font-medium">{ticket?.raffleName ?? ticket?.raffle?.name ?? "Sorteo"}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateTime(ticket?.createdAt)}</p></div>
                      </div>
                      <Badge className={getStatusColor(ticket?.status)}>{getStatusLabel(ticket?.status)}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div><p className="text-[10px] text-muted-foreground">Número</p><p className="font-mono font-bold text-lg">#{ticket?.number ?? "--"}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">Precio</p><p className="font-bold">{formatCurrency(ticket?.price)}</p></div>
                    </div>
                    {ticket?.raffleId && <Link href={`/catalog/${ticket.raffleId}`}><Button variant="ghost" size="sm" className="w-full mt-2 gap-2 text-primary"><Trophy className="h-4 w-4" /> Ver Sorteo</Button></Link>}
                  </CardContent></Card>
                </motion.div>
              ))}
            </div>
            {hasMore && <div className="text-center mt-6"><Button onClick={() => fetchTickets(false)} variant="outline" disabled={loadingMore} className="gap-2">{loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Cargar Más</Button></div>}
          </>
        )}
      </motion.div>
    </div>
  );
}
