"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { ProtectedRoute } from "@/components/protected-route";
import api from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import { BarChart3, DollarSign, Users, Trophy, Ticket, TrendingUp, Download, Calendar, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AdminReportsPage() {
  const [overview, setOverview] = useState<any>({});
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("overview");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/reports/overview").catch(() => ({ data: {} })),
      api.get("/admin/audit", { params: { limit: 20 } }).catch(() => ({ data: [] })),
    ]).then(([overviewRes, auditRes]: any[]) => {
      setOverview(overviewRes?.data ?? {});
      setAuditLog(auditRes?.data?.items ?? auditRes?.data?.logs ?? auditRes?.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: any = { type: reportType };
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await api.get("/reports/export", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res?.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `reporte-${reportType}-${Date.now()}.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Reporte descargado");
    } catch {
      toast.error("Error al exportar reporte");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Reportes y Auditoría</h1>
          <p className="text-muted-foreground mb-8">Estadísticas generales y registro de actividad</p>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Ingresos Totales", value: formatCurrency(overview?.totalRevenue ?? 0), icon: DollarSign, color: "text-green-500" },
              { label: "Usuarios Totales", value: overview?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
              { label: "Sorteos Activos", value: overview?.activeRaffles ?? 0, icon: Trophy, color: "text-amber-500" },
              { label: "Tickets Vendidos", value: overview?.totalTicketsSold ?? 0, icon: Ticket, color: "text-primary" },
            ].map((stat: any, i: number) => (
              <Card key={stat.label}><CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><stat.icon className={`h-5 w-5 ${stat.color}`} /><span className="text-xs text-muted-foreground">{stat.label}</span></div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </CardContent></Card>
            ))}
          </div>

          {/* Export Section */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Download className="h-5 w-5 text-primary" /> Exportar Reporte</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Tipo de Reporte</Label>
                  <Select value={reportType} onValueChange={(v: string) => setReportType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">General</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="users">Usuarios</SelectItem>
                      <SelectItem value="raffles">Sorteos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Desde</Label>
                  <Input type="date" value={dateFrom} onChange={(e: any) => setDateFrom(e?.target?.value ?? "")} />
                </div>
                <div className="space-y-2">
                  <Label>Hasta</Label>
                  <Input type="date" value={dateTo} onChange={(e: any) => setDateTo(e?.target?.value ?? "")} />
                </div>
                <Button className="gradient-primary text-white gap-2" onClick={handleExport} disabled={exporting}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Registro de Auditoría</CardTitle></CardHeader>
            <CardContent className="p-0">
              {(auditLog ?? []).length === 0 ? (
                <div className="p-8"><EmptyState icon={FileText} title="Sin registros" description="No hay registros de auditoría." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Detalles</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {(auditLog ?? []).map((log: any, i: number) => (
                        <TableRow key={log?.id ?? i}>
                          <TableCell className="text-sm">{formatDateTime(log?.createdAt ?? log?.timestamp)}</TableCell>
                          <TableCell className="font-medium text-sm">{log?.userName ?? log?.user?.name ?? "--"}</TableCell>
                          <TableCell className="text-sm">{log?.action ?? "--"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log?.details ?? log?.description ?? "--"}</TableCell>
                          <TableCell className="text-sm font-mono">{log?.ipAddress ?? log?.ip ?? "--"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
