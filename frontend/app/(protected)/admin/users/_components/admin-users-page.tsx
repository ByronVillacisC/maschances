"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { ProtectedRoute } from "@/components/protected-route";
import api from "@/lib/api";
import { formatDateTime, getRoleLabel, getRoleBadgeColor } from "@/lib/helpers";
import { Users, Search, Edit, Shield, Loader2, Save, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ role: "", active: true });
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) setLoading(true);
      const params: any = { limit: 20 };
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      if (!reset && cursor) params.cursor = cursor;
      const res = await api.get("/admin/users", { params });
      const data = res?.data;
      const items = data?.items ?? data?.users ?? data ?? [];
      if (reset) setUsers(items); else setUsers((prev: any[]) => [...(prev ?? []), ...items]);
      setCursor(data?.nextCursor ?? null);
      setHasMore(!!data?.nextCursor);
    } catch { if (reset) setUsers([]); }
    finally { setLoading(false); }
  }, [search, roleFilter, cursor]);

  useEffect(() => { fetchUsers(true); }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(true); };

  const openEdit = (u: any) => {
    setEditUser(u);
    setEditForm({ role: u?.role ?? "user", active: u?.active !== false });
  };

  const handleSaveUser = async () => {
    if (!editUser?.id) return;
    try {
      setSaving(true);
      await api.put(`/admin/users/${editUser.id}`, editForm);
      toast.success("Usuario actualizado");
      setEditUser(null);
      fetchUsers(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mb-8">Administra los usuarios de la plataforma</p>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o email..." value={search} onChange={(e: any) => setSearch(e?.target?.value ?? "")} className="pl-10" />
            </form>
            <Select value={roleFilter} onValueChange={(v: string) => setRoleFilter(v)}>
              <SelectTrigger className="w-[180px]"><Shield className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="user">Usuarios</SelectItem>
                <SelectItem value="owner">Organizadores</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="superadmin">Super Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? <LoadingSpinner fullPage /> : (users ?? []).length === 0 ? (
            <EmptyState icon={Users} title="Sin usuarios" description="No se encontraron usuarios." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {(users ?? []).map((u: any) => (
                        <TableRow key={u?.id ?? Math.random()}>
                          <TableCell className="font-medium">{u?.name ?? "--"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u?.email ?? "--"}</TableCell>
                          <TableCell><Badge className={getRoleBadgeColor(u?.role)}>{getRoleLabel(u?.role)}</Badge></TableCell>
                          <TableCell>{u?.active !== false ? <Badge className="bg-green-100 text-green-700">Activo</Badge> : <Badge className="bg-red-100 text-red-700">Inactivo</Badge>}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDateTime(u?.createdAt)}</TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="gap-1"><Edit className="h-3 w-3" /> Editar</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          {hasMore && <div className="text-center mt-4"><Button onClick={() => fetchUsers(false)} variant="outline">Cargar Más</Button></div>}

          {/* Edit Dialog */}
          <Dialog open={!!editUser} onOpenChange={(o: boolean) => !o && setEditUser(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Editar Usuario: {editUser?.name ?? ""}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={editForm.role} onValueChange={(v: string) => setEditForm((p: any) => ({ ...(p ?? {}), role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="owner">Organizador</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Estado Activo</Label>
                  <div className="flex gap-2">
                    <Button variant={editForm.active ? "default" : "outline"} size="sm" onClick={() => setEditForm((p: any) => ({ ...(p ?? {}), active: true }))} className="gap-1"><UserCheck className="h-3 w-3" /> Activo</Button>
                    <Button variant={!editForm.active ? "destructive" : "outline"} size="sm" onClick={() => setEditForm((p: any) => ({ ...(p ?? {}), active: false }))} className="gap-1"><UserX className="h-3 w-3" /> Inactivo</Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
                  <Button className="gradient-primary text-white gap-2" onClick={handleSaveUser} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
