"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import api from "@/lib/api";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/helpers";
import { ListChecks, Trophy, Calendar, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ProviderActiveRafflesPage() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/providers/active-raffles")
      .then((res: any) => {
        setRaffles(res?.data?.raffles ?? res?.data ?? []);
      })
      .catch(() => {
        toast.error("Error al cargar rifas activas");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-amber-600" />
            Rifas Activas
          </h1>
          <p className="text-muted-foreground mt-1">Sorteos que usan tus productos como premios</p>
        </div>
      </div>

      {raffles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No hay rifas activas con tus productos</p>
            <p className="text-sm text-muted-foreground mt-1">Cuando un sorteo use tus productos aparecerá aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {raffles.map((raffle: any) => (
            <Card key={raffle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-600" />
                      {raffle?.title ?? "Sorteo sin título"}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(raffle?.status)}>
                        {getStatusLabel(raffle?.status)}
                      </Badge>
                      {raffle?.drawAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(raffle.drawAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/catalog/${raffle.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Ver Sorteo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  Tus productos en este sorteo:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(raffle?.prizes ?? []).map((prize: any, idx: number) => {
                    const prod = prize?.product ?? {};
                    return (
                      <div key={prize?.id ?? idx} className="flex gap-3 p-3 rounded-lg border bg-card">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {prod?.imageUrl ? (
                            <Image src={prod.imageUrl} alt={prod?.name ?? "Producto"} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{prod?.name ?? "Producto"}</h4>
                            <Badge variant="outline" className="text-xs shrink-0">
                              #{prize?.position ?? idx + 1}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            Stock: {prod?.stock ?? 0}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}