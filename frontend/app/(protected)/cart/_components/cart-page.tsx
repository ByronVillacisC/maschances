"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/helpers";
import { ShoppingCart, Trash2, Trophy, Loader2, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function CartPage() {
  const router = useRouter();
  const { items, total, loading, fetchCart, removeFromCart, checkout } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleRemove = async (id: string) => {
    try { setRemoving(id); await removeFromCart(id); toast.success("Eliminado del carrito"); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? "Error al eliminar"); }
    finally { setRemoving(null); }
  };

  const handleCheckout = async () => {
    try { setCheckingOut(true); await checkout(); toast.success("¡Compra realizada!"); router.push("/my-tickets"); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? "Error en el checkout"); }
    finally { setCheckingOut(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Mi Carrito</h1>
        <p className="text-muted-foreground mb-8">Revisa tus tickets antes de completar la compra</p>
        {(items ?? []).length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Carrito vacío" description="Aún no has agregado tickets." actionLabel="Explorar Sorteos" onAction={() => router.push("/catalog")} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {(items ?? []).map((item: any, i: number) => (
                <motion.div key={item?.id ?? i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4"><div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                      {item?.image ? <Image src={item.image} alt={item?.raffleName ?? ""} fill className="object-cover" sizes="80px" /> : <div className="w-full h-full gradient-hero flex items-center justify-center"><Trophy className="h-6 w-6 text-white/40" /></div>}
                    </div>
                    <div className="flex-1 min-w-0"><h3 className="font-medium truncate">{item?.raffleName ?? "Sorteo"}</h3><p className="text-sm text-muted-foreground">Cantidad: {item?.quantity ?? 1}</p><p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> Reserva 48h</p></div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-display font-bold text-lg text-primary">{formatCurrency(item?.total ?? 0)}</p>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemove(item?.id)} disabled={removing === item?.id}>
                        {removing === item?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div></CardContent></Card>
                </motion.div>
              ))}
            </div>
            <div><Card className="sticky top-20">
              <CardHeader><CardTitle className="font-display text-lg">Resumen</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">{(items ?? []).map((item: any) => (
                  <div key={item?.id ?? Math.random()} className="flex justify-between text-sm"><span className="text-muted-foreground truncate mr-2">{item?.raffleName ?? "Sorteo"} x{item?.quantity ?? 1}</span><span>{formatCurrency(item?.total ?? 0)}</span></div>
                ))}</div>
                <div className="border-t pt-3"><div className="flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div></div>
                <Button className="w-full gradient-primary text-white text-base gap-2" size="lg" onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />} Completar Compra
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center"><Shield className="h-3 w-3" /> Pago seguro</div>
              </CardContent>
            </Card></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
