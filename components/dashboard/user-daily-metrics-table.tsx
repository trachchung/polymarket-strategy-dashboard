"use client";

import { useState, useMemo } from "react";
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
import useSWR from "swr";
import { fetchUsersDailyMetrics } from "@/lib/api";

// User addresses configuration
const USER_ADDRESSES = [
  {
    label: "Cluster ET",
    addresses: [
      {
        label: "ET1_3m/15m_5m/1h_0.85SL_0.95-0.05",
        address: "0x789eaE0370992d095669515497A9A09C22212a23",
      },
      {
        label: "ET2_3m/15m_5m/1h_0.5SL_0.95-0.05",
        address: "0xA1638b7598d06cf758E81F07bB8395b5D3fa6D8d",
      },
      {
        label: "ET3_1m/15m_3m/1h_0.85SL_0.97-0.03",
        address: "0x78a4F9B58b7e897206733210DF83BAa9A4192448",
      },
      {
        label: "ET4_All_In",
        address: "0xF9002511eB3C5E3eE05d596B0E4EaB19f30d4354",
      },
    ],
  },
  {
    label: "Crypto Daily",
    address: "0xfa84f2D7Aa990052E067beCE91aca5aE1563BaB7",
  },
  {
    label: "Crypto weekly, politics, tech",
    address: "0xCB1D6C56bd7C39a42C5d7758928cFadA02CbB9B0",
  },
  {
    label: "Test strategy before graduate (maximus 3)",
    address: "0x7Dd4fa5C3ECC4c27a476AbBd5FeBf53eBA692BD4",
  },
  {
    label: "Poly MM 1",
    address: "0x80bd3756892d0C28075B26969baF8d3BF72f7443",
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
  // Track if we're viewing a cluster or individual address
  const [selectedItem, setSelectedItem] = useState<{
    type: "cluster" | "address";
    clusterLabel?: string;
    address?: string;
  }>(() => {
    const firstItem = USER_ADDRESSES[0];
    if (firstItem.addresses) {
      return { type: "cluster", clusterLabel: firstItem.label };
    }
    return { type: "address", address: firstItem.address };
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const offset = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const apiLimit = pageSize === -1 ? undefined : pageSize;

  // Get addresses to fetch based on selection
  const addressesToFetch = useMemo(() => {
    if (selectedItem.type === "cluster") {
      const cluster = USER_ADDRESSES.find(
        (u) => u.addresses && u.label === selectedItem.clusterLabel
      );
      return cluster?.addresses?.map((a) => a.address) || [];
    }
    return selectedItem.address ? [selectedItem.address] : [];
  }, [selectedItem]);

  // Fetch aggregated data for clusters using /users/daily-metrics API
  const { data: clusterResponse, isLoading: isClusterLoading } = useSWR(
    selectedItem.type === "cluster" && addressesToFetch.length > 0
      ? ["cluster-metrics", addressesToFetch, apiLimit, offset]
      : null,
    async () => {
      return fetchUsersDailyMetrics({
        addresses: addressesToFetch,
        limit: apiLimit,
        offset: offset,
      });
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  // For individual addresses, use the existing hook
  const {
    metrics: singleMetrics,
    total: singleTotal,
    isLoading: isSingleLoading,
    hasMore: singleHasMore,
  } = useUserDailyMetrics({
    address: selectedItem.type === "address" ? selectedItem.address || "" : "",
    limit: apiLimit,
    offset: offset,
  });

  // Use cluster metrics from API or single metrics
  const metrics = useMemo(() => {
    if (selectedItem.type === "cluster" && clusterResponse) {
      return clusterResponse.data.data;
    }
    return singleMetrics;
  }, [selectedItem.type, clusterResponse, singleMetrics]);

  // Get total from API response or single metrics
  const total = useMemo(() => {
    if (selectedItem.type === "cluster" && clusterResponse) {
      return clusterResponse.data.total;
    }
    return singleTotal;
  }, [selectedItem.type, clusterResponse, singleTotal]);

  const isLoading =
    selectedItem.type === "cluster" ? isClusterLoading : isSingleLoading;
  const hasMore = selectedItem.type === "address" ? singleHasMore : false;

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
    if (selectedItem.type === "cluster") {
      return selectedItem.clusterLabel || "Cluster";
    }
    // Check if it's an address from a cluster
    for (const user of USER_ADDRESSES) {
      if (user.addresses) {
        const addr = user.addresses.find(
          (a) => a.address === selectedItem.address
        );
        if (addr) {
          return addr.label;
        }
      }
      if (user.address === selectedItem.address) {
        return user.label;
      }
    }
    return selectedItem.address || "";
  };

  const handleSelectionChange = (value: string) => {
    // Check if it's a cluster selection (format: "cluster:ClusterName")
    if (value.startsWith("cluster:")) {
      const clusterLabel = value.replace("cluster:", "");
      setSelectedItem({ type: "cluster", clusterLabel });
    } else if (value.startsWith("address:")) {
      // Individual address from cluster (format: "address:0x...")
      const address = value.replace("address:", "");
      setSelectedItem({ type: "address", address });
    } else {
      // Regular address
      setSelectedItem({ type: "address", address: value });
    }
    setCurrentPage(1);
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
            value={
              selectedItem.type === "cluster"
                ? `cluster:${selectedItem.clusterLabel}`
                : `address:${selectedItem.address}`
            }
            onChange={(e) => handleSelectionChange(e.target.value)}
            className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm min-w-[250px]"
            disabled={isLoading}
          >
            {USER_ADDRESSES.map((user) => {
              if (user.addresses) {
                // Render cluster option
                return (
                  <optgroup
                    key={`cluster-${user.label}`}
                    label={`📊 ${user.label} (Cluster)`}
                  >
                    <option value={`cluster:${user.label}`}>
                      {user.label} (Aggregated)
                    </option>
                    {user.addresses.map((addr) => (
                      <option
                        key={addr.address}
                        value={`address:${addr.address}`}
                      >
                        • {addr.label}
                      </option>
                    ))}
                  </optgroup>
                );
              }
              // Render regular address option
              return (
                <option key={user.address} value={`address:${user.address}`}>
                  {user.label}: {user.address}
                </option>
              );
            })}
          </select>
          <div className="text-xs text-[var(--color-text-secondary)]">
            Selected: {getSelectedUserLabel()}
            {selectedItem.type === "cluster" && (
              <span className="ml-1 text-blue-500">(Aggregated)</span>
            )}
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
