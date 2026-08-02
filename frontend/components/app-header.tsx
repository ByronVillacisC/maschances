"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useNotifications } from "@/lib/notification-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  History,
  Settings,
  Package,
  Trophy,
  Shield,
  Users,
  BarChart3,
  Sparkles,
  // CAMBIO: removidos Store, Box, ListChecks (links proveedor ocultos)
} from "lucide-react";
import { getRoleLabel } from "@/lib/helpers";

export function AppHeader() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { count } = useCart();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";

  const isActive = (path: string) => pathname === path || pathname?.startsWith?.(path + "/");

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const publicLinks = [
    { href: "/catalog", label: "Sorteos", icon: Trophy },
  ];

  const userLinks = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/my-tickets", label: "Mis Tickets", icon: Ticket },
    { href: "/history", label: "Historial", icon: History },
  ];

  const ownerLinks = [
    { href: "/owner/packages", label: "Mis Paquetes", icon: Package },
    { href: "/owner/raffles", label: "Mis Sorteos", icon: Trophy },
  ];

  // CAMBIO: links de proveedor OCULTOS de la navegación pública
  // Solo Admin puede gestionar proveedores desde el panel de permisos
  // const providerLinks = [
  //   { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  //   { href: "/provider/products", label: "Mis Productos", icon: Box },
  //   { href: "/provider/active-raffles", label: "Rifas Activas", icon: ListChecks },
  // ];

  const adminLinks = [
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            +CHANCES
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link: any) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}

          {/* CAMBIO: mostrar userLinks para todos los autenticados (removida exclusión de provider) */}
          {isAuthenticated && userLinks.map((link: any) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}

          {hasRole(["owner", "admin", "superadmin"]) && ownerLinks.map((link: any) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}

          {/* CAMBIO: NAV PROVEEDOR OCULTO - funcionalidad desactivada */}
          {/* Solo Admin puede gestionar proveedores desde el panel de permisos */}

          {hasRole(["admin", "superadmin"]) && adminLinks.map((link: any) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 text-orange-600 dark:text-orange-400"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* CAMBIO: mostrar carrito y notificaciones para todos los autenticados */}
          {isAuthenticated && (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-white flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase?.() ?? "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name ?? "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
                  <p className="text-xs text-primary mt-0.5">{getRoleLabel(user?.role)}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" /> Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {/* CAMBIO: siempre ir a /dashboard (removida redirección a /provider/dashboard) */}
                  <Link href="/dashboard" className="cursor-pointer gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive">
                  <LogOut className="h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gradient-primary text-white border-0">Registrarse</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-1 animate-fade-in">
          {publicLinks.map((link: any) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Button variant={isActive(link.href) ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />{link.label}
              </Button>
            </Link>
          ))}
          {/* CAMBIO: mostrar userLinks para todos los autenticados en mobile */}
          {isAuthenticated && userLinks.map((link: any) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Button variant={isActive(link.href) ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />{link.label}
              </Button>
            </Link>
          ))}
          {hasRole(["owner", "admin", "superadmin"]) && ownerLinks.map((link: any) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Button variant={isActive(link.href) ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />{link.label}
              </Button>
            </Link>
          ))}
          {/* CAMBIO: NAV PROVEEDOR OCULTO en mobile - funcionalidad desactivada */}
          {hasRole(["admin", "superadmin"]) && adminLinks.map((link: any) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Button variant={isActive(link.href) ? "secondary" : "ghost"} className="w-full justify-start gap-2 text-orange-600">
                <link.icon className="h-4 w-4" />{link.label}
              </Button>
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Iniciar Sesión</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gradient-primary text-white">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
