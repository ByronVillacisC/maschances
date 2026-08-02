"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import api from "@/lib/api";
import { Store, Box, ListChecks, TrendingUp, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/providers/me"),
      api.get("/products/my-products"),
      api.get("/providers/active-raffles"),
    ])
      .then(([providerRes, productsRes, rafflesRes]) => {
        const provider = providerRes?.data?.provider ?? providerRes?.data ?? {};
        const products = productsRes?.data?.products ?? productsRes?.data ?? [];
        const raffles = rafflesRes?.data?.raffles ?? rafflesRes?.data ?? [];

        const activeProducts = products.filter((p: any) => p?.isActive && p?.stock > 0);
        const totalValue = products.reduce((sum: number, p: any) => sum + (p?.price ?? 0), 0);

        setStats({
          businessName: provider?.businessName ?? "Mi Negocio",
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          activeRaffles: raffles.length,
          totalValue,
        });
      })
      .catch(() => {
        toast.error("Error al cargar estadísticas");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard Proveedor</h1>
          <p className="text-muted-foreground mt-1">Bienvenido, {stats?.businessName ?? user?.name ?? "Proveedor"}</p>
        </div>
        <Store className="h-10 w-10 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Box className="h-4 w-4" />
              Productos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalProducts ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{stats?.activeProducts ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Rifas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{stats?.activeRaffles ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              ${(stats?.totalValue ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-emerald-600" />
              Gestión de Productos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Administra tu catálogo de productos, actualiza stock y precios.
            </p>
            <Link href="/provider/products">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                Ver Mis Productos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-amber-600" />
              Rifas Activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Revisa en qué sorteos están siendo usados tus productos como premios.
            </p>
            <Link href="/provider/active-raffles">
              <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                Ver Rifas Activas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}