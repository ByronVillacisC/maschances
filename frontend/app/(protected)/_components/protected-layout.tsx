"use client";

import React from "react";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { ProtectedRoute } from "@/components/protected-route";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <ProtectedRoute>{children}</ProtectedRoute>
      </main>
      <AppFooter />
    </div>
  );
}
