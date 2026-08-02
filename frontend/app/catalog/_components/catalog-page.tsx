"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { RaffleCard } from "@/components/raffle-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Search, Trophy, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function CatalogPage() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [sortBy, setSortBy] = useState("newest");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchRaffles = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) setLoading(true); else setLoadingMore(true);
      const params: any = { limit: 12, status, sort: sortBy };
      if (search) params.search = search;
      if (!reset && cursor) params.cursor = cursor;
      const res = await api.get("/raffles", { params });
      const data = res?.data;
      const items = data?.items ?? data?.raffles ?? data ?? [];
      if (reset) {
        setRaffles(items);
      } else {
        setRaffles((prev: any[]) => [...(prev ?? []), ...items]);
      }
      setCursor(data?.nextCursor ?? data?.cursor ?? null);
      setHasMore(!!(data?.nextCursor ?? data?.hasMore));
    } catch {
      if (reset) setRaffles([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, status, sortBy, cursor]);

  useEffect(() => {
    fetchRaffles(true);
  }, [status, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRaffles(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Catálogo de Sorteos</h1>
            <p className="text-muted-foreground">Explora todos los sorteos disponibles y participa</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sorteos..."
                value={search}
                onChange={(e: any) => setSearch(e?.target?.value ?? "")}
                className="pl-10"
              />
            </form>
            <Select value={status} onValueChange={(v: string) => setStatus(v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: string) => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más Recientes</SelectItem>
                <SelectItem value="price_asc">Precio: Menor</SelectItem>
                <SelectItem value="price_desc">Precio: Mayor</SelectItem>
                <SelectItem value="ending_soon">Por Terminar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <LoadingSpinner text="Cargando sorteos..." fullPage />
          ) : (raffles ?? []).length === 0 ? (
            <EmptyState icon={Trophy} title="No hay sorteos" description="No se encontraron sorteos con los filtros seleccionados." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(raffles ?? []).map((raffle: any, i: number) => (
                  <motion.div
                    key={raffle?.id ?? i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <RaffleCard raffle={raffle} />
                  </motion.div>
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={() => fetchRaffles(false)} variant="outline" disabled={loadingMore} className="gap-2">
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Cargar Más
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
