"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
  onExpire?: () => void;
}

export function CountdownTimer({ targetDate, compact = false, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const now = Date.now();
      const target = new Date(targetDate ?? "").getTime();
      const diff = Math.max(0, target - now);
      if (diff === 0 && onExpire) onExpire();
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!mounted) return <span className="text-sm">--:--:--</span>;

  const { days, hours, minutes, seconds } = timeLeft;
  const isExpired = days === 0 && hours === 0 && minutes === 0 && seconds === 0;

  if (isExpired) return <span className="text-sm text-red-500 font-medium">Finalizado</span>;

  if (compact) {
    return (
      <span className="text-xs font-mono">
        {days > 0 ? `${days}d ` : ""}{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    );
  }

  const blocks = [
    { val: days, label: "Días" },
    { val: hours, label: "Hrs" },
    { val: minutes, label: "Min" },
    { val: seconds, label: "Seg" },
  ];

  return (
    <div className="flex gap-2">
      {blocks.map((b: any) => (
        <div key={b.label} className="flex flex-col items-center">
          <div className="bg-card rounded-lg shadow px-3 py-2 min-w-[48px] text-center">
            <span className="font-mono font-bold text-lg">{String(b.val).padStart(2, "0")}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
