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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDailyMetrics } from "@/hooks/use-user-daily-metrics";
import type { UserDailyMetric } from "@/lib/types";

// User addresses configuration
const USER_ADDRESSES = [
  {
    label: "Obito_15m_ET",
    address: "0x789eaE0370992d095669515497A9A09C22212a23",
  },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, -1]; // -1 represents unlimited

function MetricsRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 24 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-20" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function UserDailyMetricsTable() {
  const [selectedAddress, setSelectedAddress] = useState(
    USER_ADDRESSES[0].address
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const offset = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const apiLimit = pageSize === -1 ? undefined : pageSize;

  const { metrics, total, isLoading, hasMore } = useUserDailyMetrics({
    address: selectedAddress,
    limit: apiLimit,
    offset: offset,
  });

  const totalPages = pageSize === -1 ? 1 : Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
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

  const getSelectedUserLabel = () => {
    const user = USER_ADDRESSES.find((u) => u.address === selectedAddress);
    return user?.label || selectedAddress;
  };

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between mb-4">
          <span>User Daily Metrics</span>
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

        {/* User Address Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">User Address:</label>
          <select
            value={selectedAddress}
            onChange={(e) => {
              setSelectedAddress(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm min-w-[250px]"
            disabled={isLoading}
          >
            {USER_ADDRESSES.map((user) => (
              <option key={user.address} value={user.address}>
                {user.label}: {user.address}
              </option>
            ))}
          </select>
          <div className="text-xs text-[var(--color-text-secondary)]">
            Selected: {getSelectedUserLabel()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[2000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px]">Total Trades</TableHead>
                <TableHead className="w-[100px]">Buy Trades</TableHead>
                <TableHead className="w-[100px]">Sell Trades</TableHead>
                <TableHead className="w-[120px]">Total Size</TableHead>
                <TableHead className="w-[120px]">Buy Size</TableHead>
                <TableHead className="w-[120px]">Sell Size</TableHead>
                <TableHead className="w-[120px]">Total Value</TableHead>
                <TableHead className="w-[120px]">Buy Value</TableHead>
                <TableHead className="w-[120px]">Sell Value</TableHead>
                <TableHead className="w-[120px]">Avg Price</TableHead>
                <TableHead className="w-[120px]">Avg Buy Price</TableHead>
                <TableHead className="w-[120px]">Avg Sell Price</TableHead>
                <TableHead className="w-[120px]">Markets Traded</TableHead>
                <TableHead className="w-[120px]">Events Traded</TableHead>
                <TableHead className="w-[120px]">Closed Positions</TableHead>
                <TableHead className="w-[120px]">Profitable</TableHead>
                <TableHead className="w-[120px]">Losing</TableHead>
                <TableHead className="w-[120px]">Total Profit</TableHead>
                <TableHead className="w-[120px]">Total Loss</TableHead>
                <TableHead className="w-[120px]">Largest Profit</TableHead>
                <TableHead className="w-[120px]">Largest Loss</TableHead>
                <TableHead className="w-[120px]">Net P&L</TableHead>
                <TableHead className="w-[100px]">Win Rate</TableHead>
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
                    colSpan={24}
                    className="text-center py-8 text-[var(--color-text-secondary)]"
                  >
                    No metrics found for this user
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric: UserDailyMetric) => (
                  <TableRow key={metric.date}>
                    {/* Date */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {format(new Date(metric.date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>

                    {/* Total Trades */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.totalTrades}
                      </div>
                    </TableCell>

                    {/* Buy Trades */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {metric.buyTrades}
                      </div>
                    </TableCell>

                    {/* Sell Trades */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {metric.sellTrades}
                      </div>
                    </TableCell>

                    {/* Total Volume */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.totalVolume}
                      </div>
                    </TableCell>

                    {/* Buy Volume */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {metric.buyVolume}
                      </div>
                    </TableCell>

                    {/* Sell Volume */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {metric.sellVolume}
                      </div>
                    </TableCell>

                    {/* Total Value */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {formatCurrency(metric.totalValue)}
                      </div>
                    </TableCell>

                    {/* Buy Value */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {formatCurrency(metric.buyValue)}
                      </div>
                    </TableCell>

                    {/* Sell Value */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {formatCurrency(metric.sellValue)}
                      </div>
                    </TableCell>

                    {/* Average Price */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.averagePrice.toFixed(4)}
                      </div>
                    </TableCell>

                    {/* Average Buy Price */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {metric.averageBuyPrice.toFixed(4)}
                      </div>
                    </TableCell>

                    {/* Average Sell Price */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {metric.averageSellPrice.toFixed(4)}
                      </div>
                    </TableCell>

                    {/* Unique Markets Traded */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.uniqueMarketsTraded}
                      </div>
                    </TableCell>

                    {/* Unique Events Traded */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.uniqueEventsTraded}
                      </div>
                    </TableCell>

                    {/* Total Closed Positions */}
                    <TableCell>
                      <div className="text-sm font-mono">
                        {metric.totalClosedPositions}
                      </div>
                    </TableCell>

                    {/* Profitable Positions */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {metric.profitablePositions}
                      </div>
                    </TableCell>

                    {/* Losing Positions */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {metric.losingPositions}
                      </div>
                    </TableCell>

                    {/* Total Profit */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {formatCurrency(metric.totalProfit)}
                      </div>
                    </TableCell>

                    {/* Total Loss */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {formatCurrency(metric.totalLoss)}
                      </div>
                    </TableCell>

                    {/* Largest Profit */}
                    <TableCell>
                      <div className="text-sm font-mono text-green-500">
                        {formatCurrency(metric.largestProfit)}
                      </div>
                    </TableCell>

                    {/* Largest Loss */}
                    <TableCell>
                      <div className="text-sm font-mono text-red-500">
                        {formatCurrency(metric.largestLoss)}
                      </div>
                    </TableCell>

                    {/* Net P&L */}
                    <TableCell>
                      {getProfitLossIndicator(
                        metric.totalProfit,
                        metric.totalLoss
                      )}
                    </TableCell>

                    {/* Win Rate */}
                    <TableCell>
                      <div
                        className={`text-sm font-mono ${getWinRateColor(
                          metric.winRate
                        )}`}
                      >
                        {formatPercentage(metric.winRate)}
                      </div>
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
