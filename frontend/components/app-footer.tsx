"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              +CHANCES
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/catalog" className="hover:text-foreground transition-colors">Sorteos</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Mi Cuenta</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} +CHANCES. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
