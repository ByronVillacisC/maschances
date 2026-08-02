"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const router = useRouter();
  const { login, verify2FA, error, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code2FA, setCode2FA] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // CRÍTICO: Navega inmediatamente cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { 
      toast.error("Completa todos los campos"); 
      return; 
    }
    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result?.requires2FA) {
        setShow2FA(true);
        toast.info("Ingresa tu código de verificación 2FA");
      } else {
        toast.success("¡Bienvenido de vuelta!");
        // El useEffect manejará la navegación automáticamente
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code2FA) { 
      toast.error("Ingresa el código 2FA"); 
      return; 
    }
    try {
      setLoading(true);
      await verify2FA(code2FA);
      toast.success("¡Verificación exitosa!");
      // El useEffect manejará la navegación automáticamente
    } catch (err: any) {
      toast.error(err?.message ?? "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              +CHANCES
            </span>
          </Link>
          <CardTitle className="font-display text-xl">
            {show2FA ? "Verificación 2FA" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription>
            {show2FA
              ? "Ingresa el código de tu app de autenticación"
              : "Accede a tu cuenta para participar en sorteos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!show2FA ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e: any) => setEmail(e?.target?.value ?? "")}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e: any) => setPassword(e?.target?.value ?? "")}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Iniciar Sesión
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code2fa">Código 2FA</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code2fa"
                    type="text"
                    placeholder="000000"
                    value={code2FA}
                    onChange={(e: any) => setCode2FA(e?.target?.value ?? "")}
                    className="pl-10 text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verificar
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setShow2FA(false)}
                disabled={loading}
              >
                Volver al Login
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}