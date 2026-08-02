"use client";

// ─── CAMBIO: PÁGINA DE REGISTRO DE PROVEEDOR DESACTIVADA ─────────────────────
// El registro público de proveedores está desactivado.
// Solo Admin/Superadmin puede asignar rol 'provider' manualmente desde el panel de permisos.
// Se mantiene la página pero muestra un mensaje informativo en lugar del formulario.

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Store, ShieldAlert } from "lucide-react";

export function RegisterProviderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-40 h-40 rounded-full bg-teal-500/10 blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-emerald-600" />
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">
              +CHANCES
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="h-6 w-6 text-emerald-600" />
            <CardTitle className="font-display text-xl">Registro de Proveedor</CardTitle>
          </div>
          <CardDescription>Programa de proveedores</CardDescription>
        </CardHeader>
        <CardContent>
          {/* CAMBIO: Mensaje informativo - registro desactivado */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-lg">Registro No Disponible</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El registro público de proveedores se encuentra actualmente desactivado.
              Si deseas ser proveedor, por favor contacta al administrador de la plataforma
              para que active tu cuenta manualmente.
            </p>
            <div className="pt-2 space-y-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full gradient-primary text-white">
                  Registrarse como Usuario
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-emerald-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
