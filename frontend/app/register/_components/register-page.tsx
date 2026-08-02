"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// CAMBIO: removido import de Store (ya no se usa link de proveedor)
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Completa todos los campos obligatorios"); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden"); return;
    }
    if ((form.password?.length ?? 0) < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres"); return;
    }
    try {
      setLoading(true);
      await register({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
      toast.success("¡Cuenta creada exitosamente!");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              +CHANCES
            </span>
          </Link>
          <CardTitle className="font-display text-xl">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para participar en sorteos exclusivos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Tu nombre" value={form.name} onChange={(e: any) => updateField("name", e?.target?.value ?? "")} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Correo Electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-email" type="email" placeholder="tu@correo.com" value={form.email} onChange={(e: any) => updateField("email", e?.target?.value ?? "")} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+593 999 999 999" value={form.phone} onChange={(e: any) => updateField("phone", e?.target?.value ?? "")} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-password" type={showPassword ? "text" : "password"} placeholder="Mín. 6 caracteres" value={form.password} onChange={(e: any) => updateField("password", e?.target?.value ?? "")} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirm-password" type="password" placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={(e: any) => updateField("confirmPassword", e?.target?.value ?? "")} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crear Cuenta
            </Button>
          </form>

          {/* CAMBIO: LINK A REGISTRO PROVEEDOR REMOVIDO - funcionalidad desactivada */}
          {/* Solo Admin puede activar proveedores manualmente desde el panel de permisos */}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Inicia sesión</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
