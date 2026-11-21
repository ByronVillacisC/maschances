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
      const payload = res?.data?.data ?? res?.data;
      const list = payload?.items ?? payload?.raffles ?? payload;
      setFeaturedRaffles(Array.isArray(list) ? list : []);
    }).catch(() => {
      setFeaturedRaffles([]);
    });

    setStats({ raffles: 150, winners: 89, users: 5200 });
  }, []);

  const safeRaffles = Array.isArray(featuredRaffles) ? featuredRaffles : [];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        {/* ... (secciones principales de la landing: Hero, Estadísticas, Sorteos Destacados, Cómo Funciona y CTA) ... */}
      </section>

      <AppFooter />
    </div>
  );
}
