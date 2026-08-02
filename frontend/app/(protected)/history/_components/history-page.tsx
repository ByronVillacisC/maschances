"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/helpers";
import { History, Receipt, Clock, Loader2, DollarSign, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchHistory = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) setLoading(true); else setLoadingMore(true);
      const params: any = { limit: 20 };
      if (!reset && cursor) params.cursor = cursor;
      const res = await api.get("/history", { params });
      const data = res?.data;
      const items = data?.items ?? data?.transactions ?? data ?? [];
      if (reset) setTransactions(items); else setTransactions((prev: any[]) => [...(prev ?? []), ...items]);
      setCursor(data?.nextCursor ?? null);
      setHasMore(!!data?.nextCursor);
    } catch { if (reset) setTransactions([]); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [cursor]);

  useEffect(() => { fetchHistory(true); }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Historial</h1>
        <p className="text-muted-foreground mb-8">Registro de todas tus transacciones y compras</p>
        {loading ? <LoadingSpinner fullPage /> : (transactions ?? []).length === 0 ? (
          <EmptyState icon={History} title="Sin historial" description="Aún no tienes transacciones registradas." />
        ) : (
          <>
            <div className="space-y-3">
              {(transactions ?? []).map((tx: any, i: number) => (
                <motion.div key={tx?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            {tx?.type === "purchase" ? <Receipt className="h-5 w-5 text-primary" /> : <Trophy className="h-5 w-5 text-amber-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx?.description ?? tx?.raffleName ?? "Transacción"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateTime(tx?.createdAt ?? tx?.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold flex items-center gap-1 justify-end">
                            <DollarSign className="h-4 w-4" /> {formatCurrency(tx?.amount ?? tx?.total ?? 0)}
                          </p>
                          <Badge className={getStatusColor(tx?.status)}>{getStatusLabel(tx?.status)}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {hasMore && <div className="text-center mt-6"><Button onClick={() => fetchHistory(false)} variant="outline" disabled={loadingMore} className="gap-2">{loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Cargar Más</Button></div>}
          </>
        )}
      </motion.div>
    </div>
  );
}
