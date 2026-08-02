"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { ProtectedRoute } from "@/components/protected-route";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/helpers";
// CAMBIO: agregado Share2, Link2 para botón de compartir link
import { Trophy, Plus, Edit, Trash2, Loader2, Save, ImageIcon, Video, Eye, Users, Share2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function OwnerRafflesPage() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: "", description: "", prize: "", prizeAmount: "", price: "", totalTickets: "", drawDate: "", packageId: "", rules: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const fetchRaffles = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([
        api.get("/raffles?owned=true"),
        api.get("/owner-packages"),
      ]);
      setRaffles(rRes?.data?.items ?? rRes?.data?.raffles ?? rRes?.data ?? []);
      setPackages(pRes?.data?.items ?? pRes?.data?.packages ?? pRes?.data ?? []);
    } catch { setRaffles([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRaffles(); }, [fetchRaffles]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", prize: "", prizeAmount: "", price: "", totalTickets: "", drawDate: "", packageId: "", rules: "" });
    setImageFiles(null); setVideoFile(null);
    setDialogOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      name: r?.name ?? r?.title ?? "",
      description: r?.description ?? "",
      prize: r?.prize ?? "",
      prizeAmount: String(r?.prizeAmount ?? ""),
      price: String(r?.price ?? r?.ticketPrice ?? ""),
      totalTickets: String(r?.totalTickets ?? ""),
      drawDate: r?.drawDate?.slice?.(0, 16) ?? r?.endDate?.slice?.(0, 16) ?? "",
      packageId: r?.packageId ?? "",
      rules: r?.rules ?? "",
    });
    setImageFiles(null); setVideoFile(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.totalTickets) { toast.error("Campos obligatorios faltantes"); return; }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.description) formData.append("description", form.description);
      if (form.prize) formData.append("prize", form.prize);
      if (form.prizeAmount) formData.append("prizeAmount", form.prizeAmount);
      formData.append("price", form.price);
      formData.append("totalTickets", form.totalTickets);
      if (form.drawDate) formData.append("drawDate", new Date(form.drawDate).toISOString());
      if (form.packageId) formData.append("packageId", form.packageId);
      if (form.rules) formData.append("rules", form.rules);

      if (imageFiles) {
        for (let i = 0; i < (imageFiles?.length ?? 0); i++) {
          formData.append("images", imageFiles[i]);
        }
      }
      if (videoFile) formData.append("video", videoFile);

      if (editing) {
        await api.put(`/raffles/${editing.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/raffles", formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      // CAMBIO: mensaje actualizado indicando que el sorteo se crea activo
      toast.success(editing ? "Sorteo actualizado" : "¡Sorteo creado y activo!");
      setDialogOpen(false);
      fetchRaffles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este sorteo?")) return;
    try {
      setDeleting(id);
      await api.delete(`/raffles/${id}`);
      toast.success("Sorteo eliminado");
      fetchRaffles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  // CAMBIO: función para copiar link compartible al portapapeles
  const handleCopyShareLink = (raffle: any) => {
    const shareLink = raffle?.shareLink || `${window.location.origin}/catalog/${raffle?.id ?? ""}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success("¡Link copiado al portapapeles!");
    }).catch(() => {
      toast.error("No se pudo copiar el link");
    });
  };

  const updateField = (field: string, value: string) => setForm((p: any) => ({ ...(p ?? {}), [field]: value }));

  return (
    <ProtectedRoute roles={["owner", "admin", "superadmin"]}>
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div><h1 className="font-display text-3xl font-bold tracking-tight mb-1">Mis Sorteos</h1><p className="text-muted-foreground">Crea y gestiona tus sorteos</p></div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo Sorteo</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Sorteo" : "Nuevo Sorteo"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={(e: any) => updateField("name", e?.target?.value ?? "")} required /></div>
                    <div className="space-y-2"><Label>Premio</Label><Input value={form.prize} onChange={(e: any) => updateField("prize", e?.target?.value ?? "")} placeholder="Ej: iPhone 15 Pro" /></div>
                  </div>
                  <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={(e: any) => updateField("description", e?.target?.value ?? "")} rows={3} /></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2"><Label>Precio Ticket *</Label><Input type="number" step="0.01" value={form.price} onChange={(e: any) => updateField("price", e?.target?.value ?? "")} required /></div>
                    <div className="space-y-2"><Label>Valor Premio</Label><Input type="number" step="0.01" value={form.prizeAmount} onChange={(e: any) => updateField("prizeAmount", e?.target?.value ?? "")} /></div>
                    <div className="space-y-2"><Label>Total Tickets *</Label><Input type="number" value={form.totalTickets} onChange={(e: any) => updateField("totalTickets", e?.target?.value ?? "")} required /></div>
                    <div className="space-y-2"><Label>Fecha Sorteo</Label><Input type="datetime-local" value={form.drawDate} onChange={(e: any) => updateField("drawDate", e?.target?.value ?? "")} /></div>
                  </div>
                  {(packages ?? []).length > 0 && (
                    <div className="space-y-2">
                      <Label>Paquete</Label>
                      <Select value={form.packageId} onValueChange={(v: string) => updateField("packageId", v)}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar paquete" /></SelectTrigger>
                        <SelectContent>{(packages ?? []).map((p: any) => <SelectItem key={p?.id} value={p?.id ?? ""}>{p?.name ?? "Paquete"}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2"><Label>Reglas</Label><Textarea value={form.rules} onChange={(e: any) => updateField("rules", e?.target?.value ?? "")} rows={2} placeholder="Reglas del sorteo..." /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Imágenes</Label><Input type="file" accept="image/*" multiple onChange={(e: any) => setImageFiles(e?.target?.files ?? null)} /></div>
                    <div className="space-y-2"><Label className="flex items-center gap-1"><Video className="h-4 w-4" /> Video</Label><Input type="file" accept="video/*" onChange={(e: any) => setVideoFile(e?.target?.files?.[0] ?? null)} /></div>
                  </div>
                  {/* CAMBIO: nota informativa sobre estado activo automático */}
                  {!editing && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        El sorteo se creará con estado <strong>Activo</strong> y se generará automáticamente un link para compartir.
                      </p>
                    </div>
                  )}
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

          {loading ? <LoadingSpinner fullPage /> : (raffles ?? []).length === 0 ? (
            <EmptyState icon={Trophy} title="Sin sorteos" description="Crea tu primer sorteo." actionLabel="Crear Sorteo" onAction={openCreate} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(raffles ?? []).map((r: any, i: number) => (
                <motion.div key={r?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div><h3 className="font-medium">{r?.name ?? r?.title ?? "Sorteo"}</h3><p className="text-xs text-muted-foreground">{formatDateTime(r?.drawDate ?? r?.endDate)}</p></div>
                        <Badge className={getStatusColor(r?.status)}>{getStatusLabel(r?.status)}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 rounded bg-muted text-center"><p className="text-[10px] text-muted-foreground">Precio</p><p className="font-bold text-sm">{formatCurrency(r?.price ?? r?.ticketPrice)}</p></div>
                        <div className="p-2 rounded bg-muted text-center"><p className="text-[10px] text-muted-foreground">Vendidos</p><p className="font-bold text-sm">{r?.soldTickets ?? 0}/{r?.totalTickets ?? 0}</p></div>
                      </div>
                      {/* CAMBIO: mostrar link compartible si existe */}
                      {r?.shareLink && (
                        <div className="mb-3 p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300">
                            <Link2 className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{r.shareLink}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(r)}><Edit className="h-3 w-3" /> Editar</Button>
                        {/* CAMBIO: botón para copiar link compartible */}
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleCopyShareLink(r)} title="Copiar link"><Share2 className="h-3 w-3" /></Button>
                        <Button variant="outline" size="sm" className="gap-1" asChild><a href={`/catalog/${r?.id ?? ""}`}><Eye className="h-3 w-3" /></a></Button>
                        <Button variant="outline" size="sm" className="text-destructive gap-1" onClick={() => handleDelete(r?.id)} disabled={deleting === r?.id}>
                          {deleting === r?.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
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
