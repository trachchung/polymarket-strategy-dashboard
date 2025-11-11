"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  History,
  Home,
  Settings,
  Activity,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Daily Metrics", icon: Activity, href: "/daily-metrics" },
  { name: "User Metrics", icon: Users, href: "/user-metrics" },
  { name: "Perp Bet Hedging", icon: BarChart3, href: "/perp-bet-hedging" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-[var(--color-surface)] lg:flex">
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href === "/" && pathname === "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-[var(--color-surface-elevated)] p-4">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            API Status
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
            <span className="text-sm font-medium">Connected</span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            Last update: 2s ago
          </p>
        </div>
      </div>
    </aside>
  );
}
