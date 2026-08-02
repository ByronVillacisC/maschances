"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { CountdownTimer } from "@/components/countdown-timer";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import api from "@/lib/api";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/helpers";
import {
  Trophy,
  Clock,
  Ticket,
  Users,
  ShoppingCart,
  ArrowLeft,
  Calendar,
  DollarSign,
  Minus,
  Plus,
  CheckCircle2,
  Info,
  Shield,
  Gift,
  Package,
  // CAMBIO: agregado Share2 para botón de compartir
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function RaffleDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/raffles/${id}`).then((res: any) => {
      setRaffle(res?.data?.raffle ?? res?.data ?? null);
    }).catch(() => {
      toast.error("No se pudo cargar el sorteo");
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Inicia sesión para comprar tickets");
      router.push("/login");
      return;
    }
    try {
      setAdding(true);
      await addToCart(id, quantity);
      toast.success(`${quantity} ticket(s) agregado(s) al carrito`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al agregar al carrito");
    } finally {
      setAdding(false);
    }
  };

  // CAMBIO: función para compartir link del sorteo
  const handleShareLink = () => {
    const shareLink = raffle?.shareLink || `${window.location.origin}/catalog/${id}`;
    if (navigator.share) {
      navigator.share({
        title: raffle?.name ?? raffle?.title ?? "Sorteo +CHANCES",
        text: `¡Participa en este sorteo: ${raffle?.name ?? raffle?.title ?? ""}!`,
        url: shareLink,
      }).catch(() => {
        // fallback: copiar al portapapeles
        navigator.clipboard.writeText(shareLink);
        toast.success("¡Link copiado al portapapeles!");
      });
    } else {
      navigator.clipboard.writeText(shareLink).then(() => {
        toast.success("¡Link copiado al portapapeles!");
      }).catch(() => {
        toast.error("No se pudo copiar el link");
      });
    }
  };

  if (loading) return (<div className="min-h-screen flex flex-col"><AppHeader /><LoadingSpinner fullPage /><AppFooter /></div>);
  if (!raffle) return (
    <div className="min-h-screen flex flex-col"><AppHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Sorteo no encontrado</p>
          <Link href="/catalog"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Button></Link>
        </div>
      </div>
    <AppFooter /></div>
  );

  const r = raffle ?? {};
  const name = r?.name ?? r?.title ?? "Sorteo";
  const image = r?.image ?? r?.imageUrl;
  const price = r?.price ?? r?.ticketPrice ?? 0;
  const endDate = r?.drawDate ?? r?.endDate;
  const total = r?.totalTickets ?? 0;
  const sold = r?.soldTickets ?? 0;
  const available = r?.availableTickets ?? (total - sold);
  const progress = total > 0 ? Math.min(100, (sold / total) * 100) : 0;
  const maxQty = Math.min(available, r?.maxTicketsPerUser ?? 50);
  const prizes = r?.prizes ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/catalog">
              <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Button>
            </Link>
            {/* CAMBIO: botón para compartir link del sorteo */}
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShareLink}>
              <Share2 className="h-4 w-4" /> Compartir
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left - Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
              <div className="relative aspect-[16/10] bg-muted rounded-xl overflow-hidden">
                {image ? (
                  <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
                ) : (
                  <div className="w-full h-full gradient-hero flex items-center justify-center"><Trophy className="h-20 w-20 text-white/30" /></div>
                )}
                {r?.status && <Badge className={`absolute top-4 left-4 ${getStatusColor(r.status)}`}>{getStatusLabel(r.status)}</Badge>}
              </div>

              {/* FASE 8 - PREMIOS DE PRODUCTOS (sin cambios - se mantiene) */}
              {prizes.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-amber-500" /> 
                      Premios del Sorteo
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {prizes.map((prize: any, idx: number) => {
                        const prod = prize?.product ?? {};
                        return (
                          <div key={prize?.id ?? idx} className="flex gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              {prod?.imageUrl ? (
                                <Image src={prod.imageUrl} alt={prod?.name ?? "Premio"} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm line-clamp-2">{prod?.name ?? "Premio"}</h3>
                                <Badge variant="outline" className="text-xs shrink-0">#{prize?.position ?? idx + 1}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prod?.description ?? ""}</p>
                              {prod?.price && (
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                                  Valor: {formatCurrency(prod.price)}
                                </p>
                              )}
                              {prod?.provider?.businessName && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Por: {prod.provider.businessName}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Descripción</h2>
                  <p className="text-muted-foreground leading-relaxed">{r?.description ?? "Sin descripción disponible."}</p>
                  {r?.rules && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold text-sm mb-2">Reglas del Sorteo</h3>
                      <p className="text-sm text-muted-foreground">{r.rules}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right - Details & Purchase */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h1 className="font-display text-2xl font-bold tracking-tight">{name}</h1>
                  {r?.prize && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <span className="font-semibold text-amber-700 dark:text-amber-400">Premio: {r.prize}</span>
                    </div>
                  )}
                  {r?.prizeAmount && (
                    <div className="text-center py-3 rounded-lg gradient-gold">
                      <p className="text-xs text-amber-800">Valor del premio</p>
                      <p className="font-display text-3xl font-bold text-amber-900">{formatCurrency(r.prizeAmount)}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <div><p className="text-[10px] text-muted-foreground">Precio</p><p className="font-bold text-sm">{formatCurrency(price)}</p></div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Ticket className="h-4 w-4 text-primary" />
                      <div><p className="text-[10px] text-muted-foreground">Disponibles</p><p className="font-bold text-sm">{available}</p></div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Users className="h-4 w-4 text-primary" />
                      <div><p className="text-[10px] text-muted-foreground">Vendidos</p><p className="font-bold text-sm">{sold}/{total}</p></div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div><p className="text-[10px] text-muted-foreground">Fecha</p><p className="font-bold text-sm text-xs">{formatDate(endDate)}</p></div>
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso de venta</span><span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {endDate && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 justify-center"><Clock className="h-3 w-3" /> Tiempo restante</p>
                      <CountdownTimer targetDate={endDate} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Purchase Card */}
              {r?.status === "active" && available > 0 && (
                <Card className="border-primary/30">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-primary" /> Comprar Tickets
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input type="number" value={quantity} onChange={(e: any) => {
                        const v = parseInt(e?.target?.value ?? "1", 10);
                        setQuantity(Math.max(1, Math.min(maxQty, isNaN(v) ? 1 : v)));
                      }} className="w-20 text-center font-bold text-lg" min={1} max={maxQty} />
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-display text-2xl font-bold text-primary">{formatCurrency(price * quantity)}</span>
                    </div>
                    <Button className="w-full gradient-primary text-white text-base gap-2" size="lg" onClick={handleAddToCart} disabled={adding}>
                      {adding ? <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <ShoppingCart className="h-5 w-5" />}
                      Agregar al Carrito
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                      <Shield className="h-3 w-3" /> Reserva válida por 48 horas
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
