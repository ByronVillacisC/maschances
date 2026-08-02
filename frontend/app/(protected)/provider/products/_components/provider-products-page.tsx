"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/helpers";
import { Box, Plus, Edit, Trash2, Upload, Video, Image as ImageIcon, Loader2, Package, MapPin } from "lucide-react";
import { toast } from "sonner";

export function ProviderProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    claimAddress: "",
    stock: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/my-products");
      setProducts(res?.data?.products ?? res?.data ?? []);
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", claimAddress: "", stock: "" });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview("");
    setVideoPreview("");
    setDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price?.toString() ?? "",
      claimAddress: product?.claimAddress ?? "",
      stock: product?.stock?.toString() ?? "",
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(product?.imageUrl ?? "");
    setVideoPreview(product?.videoUrl ?? "");
    setDialogOpen(true);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("El video no debe superar 50MB");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    if (form.description) formData.append("description", form.description);
    if (form.claimAddress) formData.append("claimAddress", form.claimAddress);
    if (imageFile) formData.append("image", imageFile);
    if (videoFile) formData.append("video", videoFile);

    try {
      setSubmitting(true);
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto actualizado exitosamente");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto creado exitosamente");
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al guardar producto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (productId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/products/${productId}`, { isActive: !currentStatus });
      toast.success(!currentStatus ? "Producto activado" : "Producto desactivado");
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al cambiar estado");
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Producto eliminado");
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al eliminar producto");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
            <Box className="h-8 w-8 text-emerald-600" />
            Mis Productos
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No tienes productos registrados</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primer producto para comenzar</p>
            <Button onClick={openCreateDialog} className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white gap-2">
              <Plus className="h-4 w-4" />
              Crear Producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {product?.imageUrl ? (
                  <Image src={product.imageUrl} alt={product?.name ?? "Producto"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {!product?.isActive && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">Inactivo</Badge>
                )}
                {product?.stock === 0 && (
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-white">Sin Stock</Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{product?.name ?? "Sin nombre"}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product?.description ?? "Sin descripción"}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(product?.price ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stock</p>
                    <p className="font-bold">{product?.stock ?? 0}</p>
                  </div>
                </div>
                {product?.claimAddress && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{product.claimAddress}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product?.isActive ?? false}
                      onCheckedChange={() => handleToggleActive(product.id, product?.isActive ?? false)}
                    />
                    <span className="text-xs text-muted-foreground">Activo</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  placeholder="Ej: iPhone 15 Pro Max"
                  value={form.name}
                  onChange={(e: any) => updateField("name", e?.target?.value ?? "")}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción detallada del producto..."
                  value={form.description}
                  onChange={(e: any) => updateField("description", e?.target?.value ?? "")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="99.99"
                  value={form.price}
                  onChange={(e: any) => updateField("price", e?.target?.value ?? "")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={form.stock}
                  onChange={(e: any) => updateField("stock", e?.target?.value ?? "")}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="claimAddress">Dirección de Retiro (opcional)</Label>
                <Input
                  id="claimAddress"
                  placeholder="Ej: Av. Principal 123, Quito"
                  value={form.claimAddress}
                  onChange={(e: any) => updateField("claimAddress", e?.target?.value ?? "")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Imagen (máx. 5MB)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {imageFile ? imageFile.name : "Subir Imagen"}
                  </Button>
                </div>
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-md overflow-hidden border">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="video">Video (máx. 50MB, opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("video")?.click()}
                    className="w-full gap-2"
                  >
                    <Video className="h-4 w-4" />
                    {videoFile ? videoFile.name : "Subir Video"}
                  </Button>
                </div>
                {videoPreview && (
                  <video src={videoPreview} controls className="w-full h-32 rounded-md border" />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProduct ? "Actualizar" : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}