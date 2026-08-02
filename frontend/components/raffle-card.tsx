"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Ticket, Users, ArrowRight } from "lucide-react";
import { formatCurrency, getStatusLabel, getStatusColor } from "@/lib/helpers";
import { CountdownTimer } from "@/components/countdown-timer";

interface RaffleCardProps {
  raffle: {
    id: string;
    name?: string;
    title?: string;
    description?: string;
    prize?: string;
    prizeAmount?: number;
    price?: number;
    ticketPrice?: number;
    image?: string | null;
    imageUrl?: string | null;
    status?: string;
    drawDate?: string | null;
    endDate?: string | null;
    totalTickets?: number;
    soldTickets?: number;
    availableTickets?: number;
  };
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const r = raffle ?? {};
  const name = r?.name ?? r?.title ?? "Sorteo";
  const image = r?.image ?? r?.imageUrl;
  const price = r?.price ?? r?.ticketPrice ?? 0;
  const endDate = r?.drawDate ?? r?.endDate;
  const total = r?.totalTickets ?? 0;
  const sold = r?.soldTickets ?? 0;
  const available = r?.availableTickets ?? (total - sold);
  const progress = total > 0 ? Math.min(100, (sold / total) * 100) : 0;

  return (
    <Link href={`/catalog/${r?.id ?? ""}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full gradient-hero flex items-center justify-center">
              <Trophy className="h-12 w-12 text-white/40" />
            </div>
          )}
          {r?.status && (
            <Badge className={`absolute top-3 left-3 ${getStatusColor(r.status)}`}>
              {getStatusLabel(r.status)}
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-display font-bold text-lg truncate drop-shadow">{name}</p>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          {r?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
          )}
          {r?.prize && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-amber-600 dark:text-amber-400">{r.prize}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Ticket className="h-4 w-4 text-primary" />
              <span className="font-display font-bold text-lg text-primary">{formatCurrency(price)}</span>
            </div>
            {endDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <CountdownTimer targetDate={endDate} compact />
              </div>
            )}
          </div>
          {total > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {sold}/{total}</span>
                <span>{available} disponibles</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full gap-2 group-hover:text-primary">
            Ver Detalles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
