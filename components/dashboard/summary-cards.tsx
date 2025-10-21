"use client";

import type React from "react";
import { useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAggregatedSweeps } from "@/hooks/use-sweeps";
import { cn } from "@/lib/utils";
import type { AggregationPeriod } from "@/lib/types";

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

function SummaryCard({
  title,
  value,
  change,
  changeType,
  icon,
  subtitle,
}: SummaryCardProps) {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-[var(--color-surface-elevated)] p-2">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {subtitle}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1 text-xs">
          {changeType === "positive" && (
            <>
              <ArrowUp className="h-3 w-3 text-[var(--color-success)]" />
              <span className="font-medium text-[var(--color-success)]">
                {change}
              </span>
            </>
          )}
          {changeType === "negative" && (
            <>
              <ArrowDown className="h-3 w-3 text-[var(--color-danger)]" />
              <span className="font-medium text-[var(--color-danger)]">
                {change}
              </span>
            </>
          )}
          {changeType === "neutral" && (
            <span className="font-medium text-[var(--color-text-secondary)]">
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-1 h-3 w-32" />
        <Skeleton className="mt-2 h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export function SummaryCards() {
  const [period, setPeriod] = useState<AggregationPeriod>("all");
  const { aggregatedData, isLoading } = useAggregatedSweeps({ period });

  const periodOptions: { value: AggregationPeriod; label: string }[] = [
    { value: "1d", label: "1 day" },
    { value: "3d", label: "3 days" },
    { value: "7d", label: "7 days" },
    { value: "1m", label: "1 month" },
    { value: "all", label: "All time" },
  ];

  if (isLoading || !aggregatedData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sweeps Performance</h2>
          <div className="flex gap-1">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(option.value)}
                className="h-8"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const successRate = aggregatedData.success_rate;
  const successRateType =
    successRate >= 90 ? "positive" : successRate >= 70 ? "neutral" : "negative";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sweeps Performance</h2>
        <div className="flex gap-1">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(option.value)}
              className="h-8"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Sweeps"
          value={aggregatedData.total_sweeps.toString()}
          change={`${aggregatedData.successful_sweeps} successful, ${aggregatedData.failed_sweeps} failed`}
          changeType="neutral"
          icon={<Target className="h-4 w-4 text-[var(--color-primary)]" />}
          subtitle={`Period: ${aggregatedData.period}`}
        />
        <SummaryCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          change={`${aggregatedData.successful_sweeps} out of ${aggregatedData.total_sweeps}`}
          changeType={successRateType}
          icon={<CheckCircle className="h-4 w-4 text-[var(--color-success)]" />}
          subtitle="Execution success rate"
        />
        <SummaryCard
          title="Total Size Value Possibly Sweep"
          value={`$${aggregatedData.total_big_odd_ask_value.toLocaleString(
            "en-US",
            { maximumFractionDigits: 0 }
          )}`}
          change={`$${aggregatedData.total_post_order_value.toLocaleString(
            "en-US",
            { maximumFractionDigits: 0 }
          )} executed`}
          changeType="positive"
          icon={<DollarSign className="h-4 w-4 text-[var(--color-success)]" />}
          subtitle="Big odd ask value"
        />
        <SummaryCard
          title="Total Value Swept"
          value={`$${aggregatedData.total_post_order_value.toLocaleString(
            "en-US",
            { maximumFractionDigits: 0 }
          )}`}
          change={`${(
            (aggregatedData.total_post_order_value /
              aggregatedData.total_big_odd_ask_value) *
            100
          ).toFixed(1)}% of total`}
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4 text-[var(--color-accent)]" />}
          subtitle="Post order value"
        />
      </div>
    </div>
  );
}
