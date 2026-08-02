"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function LoadingSpinner({ text = "Cargando...", size = "md", fullPage = false }: LoadingSpinnerProps) {
  const sizeMap = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeMap[size] ?? sizeMap.md} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }
  return content;
}
