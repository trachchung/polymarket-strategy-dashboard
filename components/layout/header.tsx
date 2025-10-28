"use client";

import { Bell, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[var(--color-surface)] backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/95">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Prediction Market Vét
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Real-time sweeps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg bg-[var(--color-surface-elevated)] px-3 py-1.5 md:flex">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-success)]" />
            <span className="text-sm font-medium">Live</span>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              variant="destructive"
            >
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
