"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyMetrics } from "@/hooks/use-daily-metrics";
import type { DailyMetric } from "@/lib/types";

function MetricsRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
    </TableRow>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, -1]; // -1 represents unlimited

export function DailyMetricsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const offset = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const apiLimit = pageSize === -1 ? undefined : pageSize;

  const { metrics, total, isLoading, hasMore } = useDailyMetrics({
    limit: apiLimit,
    offset: offset,
  });

  const totalPages = pageSize === -1 ? 1 : Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 90) return "text-green-500";
    if (winRate >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getProfitLossIndicator = (profit: number, loss: number) => {
    const net = profit - loss;
    if (net > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs font-mono">{formatCurrency(net)}</span>
        </div>
      );
    } else if (net < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <TrendingDown className="h-3 w-3" />
          <span className="text-xs font-mono">
            {formatCurrency(Math.abs(net))}
          </span>
        </div>
      );
    }
    return (
      <span className="text-xs font-mono text-[var(--color-text-secondary)]">
        $0.00
      </span>
    );
  };

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daily Trading Metrics</span>
          <div className="text-sm font-normal text-[var(--color-text-secondary)]">
            {total} days of data
            {totalPages > 1 && (
              <span className="ml-2">
                • Page {currentPage} of {totalPages} (
                {pageSize === -1 ? "unlimited" : `${pageSize} per page`})
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px]">Total Sweeps</TableHead>
                <TableHead className="w-[140px]">Total Sent Value</TableHead>
                <TableHead className="w-[140px]">Max Possible Value</TableHead>
                <TableHead className="w-[120px]">Total Profit</TableHead>
                <TableHead className="w-[120px]">Total Loss</TableHead>
                <TableHead className="w-[100px]">Win/Loss</TableHead>
                <TableHead className="w-[100px]">Win Rate</TableHead>
                <TableHead className="w-[120px]">Net P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <MetricsRowSkeleton key={i} />
                ))
              ) : metrics.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-[var(--color-text-secondary)]"
                  >
                    No metrics found
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric: DailyMetric) => (
                  <TableRow key={metric.date}>
                    {/* Date */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {format(new Date(metric.date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>

                    {/* Total Sweeps */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.total_sweeps}
                      </div>
                    </TableCell>

                    {/* Total Sent Value */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {formatCurrency(metric.total_sent_value)}
                      </div>
                    </TableCell>

                    {/* Max Possible Value */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {formatCurrency(metric.max_possible_value)}
                      </div>
                    </TableCell>

                    {/* Total Profit */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {formatCurrency(metric.total_profit)}
                      </div>
                    </TableCell>

                    {/* Total Loss */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {formatCurrency(metric.total_loss)}
                      </div>
                    </TableCell>

                    {/* Win/Loss */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-500">
                          {metric.win_sweeps}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          /
                        </span>
                        <span className="text-xs text-red-500">
                          {metric.lose_sweeps}
                        </span>
                      </div>
                    </TableCell>

                    {/* Win Rate */}
                    <TableCell>
                      <div
                        className={`text-sm font-mono ${getWinRateColor(
                          metric.win_rate
                        )}`}
                      >
                        {formatPercentage(metric.win_rate)}
                      </div>
                    </TableCell>

                    {/* Net P&L */}
                    <TableCell>
                      {getProfitLossIndicator(
                        metric.total_profit,
                        metric.total_loss
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-[var(--color-text-secondary)]">
                {pageSize === -1
                  ? `Showing all ${total} results`
                  : `Showing ${offset + 1} to ${Math.min(
                      offset + pageSize,
                      total
                    )} of ${total} results`}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Rows per page:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-sm"
                  disabled={isLoading}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size === -1 ? "Unlimited" : size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
