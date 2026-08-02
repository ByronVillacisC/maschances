"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <LoadingSpinner fullPage text="Redirigiendo..." />;
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">Acceso Denegado</p>
          <p className="text-sm text-muted-foreground mt-1">No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
