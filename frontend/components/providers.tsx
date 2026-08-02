"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { NotificationProvider } from "@/lib/notification-context";
import { Toaster } from "@/components/ui/sonner";
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            {children}
            <Toaster />
            <ChunkLoadErrorHandler />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
