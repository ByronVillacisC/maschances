"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { getRoleLabel, getRoleBadgeColor, formatDate } from "@/lib/helpers";
import { User, Mail, Phone, Calendar, Shield, Save, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPass, setChangingPass] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/users/me", { name: form.name, phone: form.phone || null });
      await refreshUser();
      toast.success("Perfil actualizado");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error("Las contraseñas no coinciden"); return;
    }
    if ((passwordForm.newPass?.length ?? 0) < 6) {
      toast.error("Mínimo 6 caracteres"); return;
    }
    try {
      setChangingPass(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      });
      toast.success("Contraseña actualizada");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al cambiar contraseña");
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Mi Perfil</h1>
        <p className="text-muted-foreground mb-8">Administra tu información personal</p>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase?.() ?? "U"}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{user?.name ?? "Usuario"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
                <Badge className={`mt-1 ${getRoleBadgeColor(user?.role)}`}>{getRoleLabel(user?.role)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-name">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="prof-name" value={form.name} onChange={(e: any) => updateField("name", e?.target?.value ?? "")} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="prof-phone" value={form.phone} onChange={(e: any) => updateField("phone", e?.target?.value ?? "")} className="pl-10" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /> Miembro desde: {formatDate(user?.createdAt)}
              </div>
              <Button type="submit" className="gradient-primary text-white gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Cambiar Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Contraseña Actual</Label>
                <Input type="password" value={passwordForm.current} onChange={(e: any) => setPasswordForm((p: any) => ({ ...(p ?? {}), current: e?.target?.value ?? "" }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nueva Contraseña</Label>
                  <Input type="password" value={passwordForm.newPass} onChange={(e: any) => setPasswordForm((p: any) => ({ ...(p ?? {}), newPass: e?.target?.value ?? "" }))} />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nueva</Label>
                  <Input type="password" value={passwordForm.confirm} onChange={(e: any) => setPasswordForm((p: any) => ({ ...(p ?? {}), confirm: e?.target?.value ?? "" }))} />
                </div>
              </div>
              <Button type="submit" variant="outline" className="gap-2" disabled={changingPass}>
                {changingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} Cambiar Contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
