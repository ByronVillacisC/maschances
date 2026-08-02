"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { RaffleCard } from "@/components/raffle-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import {
  Sparkles,
  Trophy,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Gift,
  Ticket,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [featuredRaffles, setFeaturedRaffles] = useState<any[]>([]);
  const [stats, setStats] = useState({ raffles: 0, winners: 0, users: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.get("/raffles?limit=6&status=active").then((res: any) => {
      setFeaturedRaffles(res?.data?.items ?? res?.data?.raffles ?? res?.data ?? []);
    }).catch(() => {});

    // Mock stats for display
    setStats({ raffles: 150, winners: 89, users: 5200 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-500/30 blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-24 h-24 rounded-full bg-primary/30 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="mx-auto max-w-[1200px] px-4 py-20 md:py-32 relative z-10">
          <motion.div className="max-w-2xl" {...fadeUp}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-white/80">La plataforma #1 de sorteos en línea</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Multiplica tus{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                oportunidades
              </span>
              {" "}de ganar
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-lg">
              Participa en sorteos exclusivos, elige tus números de la suerte y gana premios increíbles. Transparencia total, resultados verificables.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg" className="gradient-gold text-amber-900 font-bold text-base gap-2 hover:opacity-90 transition shadow-lg">
                  <Trophy className="h-5 w-5" /> Ver Sorteos
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/register">
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 gap-2 text-base">
                    Crear Cuenta <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b">
        <div className="mx-auto max-w-[1200px] px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Trophy, value: stats.raffles, label: "Sorteos Realizados", color: "text-primary" },
              { icon: Gift, value: stats.winners, label: "Ganadores", color: "text-amber-500" },
              { icon: Users, value: stats.users, label: "Participantes", color: "text-green-500" },
            ].map((stat: any, i: number) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 justify-center"
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <div>
                  <p className="font-display font-bold text-xl md:text-2xl">
                    {mounted ? <AnimatedNumber value={stat.value} /> : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Raffles */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-[1200px] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Sorteos Destacados</h2>
            <p className="text-muted-foreground">Descubre las rifas más populares y participa ahora</p>
          </motion.div>
          {(featuredRaffles ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredRaffles ?? []).slice(0, 6).map((raffle: any, i: number) => (
                <motion.div
                  key={raffle?.id ?? i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <RaffleCard raffle={raffle} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i: number) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[16/10] gradient-hero flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-white/20" />
                  </div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/catalog">
              <Button size="lg" className="gradient-primary text-white gap-2">
                Ver Todos los Sorteos <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight mb-2">¿Cómo Funciona?</h2>
            <p className="text-muted-foreground">Tres pasos sencillos para participar</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Ticket,
                step: "01",
                title: "Elige tu Sorteo",
                desc: "Navega por nuestro catálogo de sorteos activos y elige el que más te guste.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: ShieldCheck,
                step: "02",
                title: "Compra tus Tickets",
                desc: "Selecciona la cantidad de tickets, agrégalos al carrito y completa el pago seguro.",
                color: "from-amber-500 to-amber-600",
              },
              {
                icon: Trophy,
                step: "03",
                title: "¡Gana Premios!",
                desc: "Espera el sorteo y, si eres el ganador, reclama tu premio de manera rápida.",
                color: "from-green-500 to-green-600",
              },
            ].map((item: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto w-14 h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">Paso {item.step}</span>
                    <h3 className="font-display font-bold text-lg mt-1 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-hero">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              ¿Listo para probar tu suerte?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Únete a miles de participantes y descubre si hoy es tu día de suerte.
            </p>
            <Link href={isAuthenticated ? "/catalog" : "/register"}>
              <Button size="lg" className="gradient-gold text-amber-900 font-bold text-base gap-2 shadow-lg">
                {isAuthenticated ? "Ver Sorteos" : "Comenzar Ahora"}
                <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}

/* Animated Number Counter */
function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value ?? 0;
    if (end === 0) return;
    const duration = 1500;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count?.toLocaleString?.() ?? "0"}</>;
}
