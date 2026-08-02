"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { ProtectedRoute } from "@/components/protected-route";
import api from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import { Package, Plus, Edit, Trash2, Loader2, Save, ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function OwnerPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", maxRaffles: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner-packages");
      setPackages(res?.data?.items ?? res?.data?.packages ?? res?.data ?? []);
    } catch { setPackages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", maxRaffles: "" });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (pkg: any) => {
    setEditing(pkg);
    setForm({
      name: pkg?.name ?? "",
      description: pkg?.description ?? "",
      price: String(pkg?.price ?? ""),
      maxRaffles: String(pkg?.maxRaffles ?? ""),
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Nombre y precio son obligatorios"); return; }
    try {
      setSaving(true);
      const payload: any = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        maxRaffles: form.maxRaffles ? parseInt(form.maxRaffles) : undefined,
      };

      if (imageFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => { if (v !== undefined) formData.append(k, String(v)); });
        formData.append("image", imageFile);
        if (editing) {
          await api.put(`/owner-packages/${editing.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await api.post("/owner-packages", formData, { headers: { "Content-Type": "multipart/form-data" } });
        }
      } else {
        if (editing) {
          await api.put(`/owner-packages/${editing.id}`, payload);
        } else {
          await api.post("/owner-packages", payload);
        }
      }

      toast.success(editing ? "Paquete actualizado" : "Paquete creado");
      setDialogOpen(false);
      fetchPackages();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este paquete?")) return;
    try {
      setDeleting(id);
      await api.delete(`/owner-packages/${id}`);
      toast.success("Paquete eliminado");
      fetchPackages();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ProtectedRoute roles={["owner", "admin", "superadmin"]}>
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Mis Paquetes</h1>
              <p className="text-muted-foreground">Gestiona tus paquetes de sorteos</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo Paquete</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Paquete" : "Nuevo Paquete"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), name: e?.target?.value ?? "" }))} required /></div>
                  <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), description: e?.target?.value ?? "" }))} rows={3} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Precio (USD) *</Label><Input type="number" step="0.01" value={form.price} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), price: e?.target?.value ?? "" }))} required /></div>
                    <div className="space-y-2"><Label>Máx. Sorteos</Label><Input type="number" value={form.maxRaffles} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), maxRaffles: e?.target?.value ?? "" }))} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Imagen</Label>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e: any) => setImageFile(e?.target?.files?.[0] ?? null)} className="flex-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" className="gradient-primary text-white gap-2" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editing ? "Actualizar" : "Crear"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? <LoadingSpinner fullPage /> : (packages ?? []).length === 0 ? (
            <EmptyState icon={Package} title="Sin paquetes" description="Crea tu primer paquete de sorteos." actionLabel="Crear Paquete" onAction={openCreate} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(packages ?? []).map((pkg: any, i: number) => (
                <motion.div key={pkg?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-500" />
                          </div>
                          <div><h3 className="font-medium">{pkg?.name ?? "Paquete"}</h3><p className="text-xs text-muted-foreground">{formatDateTime(pkg?.createdAt)}</p></div>
                        </div>
                        <Badge variant="outline">{formatCurrency(pkg?.price)}</Badge>
                      </div>
                      {pkg?.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pkg.description}</p>}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(pkg)}><Edit className="h-3 w-3" /> Editar</Button>
                        <Button variant="outline" size="sm" className="text-destructive gap-1" onClick={() => handleDelete(pkg?.id)} disabled={deleting === pkg?.id}>
                          {deleting === pkg?.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
