"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Copy,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useSweeps } from "@/hooks/use-sweeps";
import { SweepDetailDialog } from "./sweep-detail-dialog";
import type {
  SweepSortField,
  SortDirection,
  Sweep,
  MarketType,
} from "@/lib/types";

interface SweepsTableProps {
  limit?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, -1]; // -1 represents unlimited

function SweepRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
    </TableRow>
  );
}

export function SweepsTable({ limit = 10 }: SweepsTableProps) {
  const [sortField, setSortField] = useState<SweepSortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit);
  const [selectedSweep, setSelectedSweep] = useState<Sweep | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchSlug, setSearchSlug] = useState("");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [searchMarketType, setSearchMarketType] = useState<MarketType | "">("");

  const offset = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const apiLimit = pageSize === -1 ? undefined : pageSize;

  const { sweeps, total, hasMore, isLoading } = useSweeps({
    limit: apiLimit,
    offset,
    sort_field: sortField,
    sort_direction: sortDirection,
    market_slug: searchSlug || undefined,
    market_question: searchQuestion || undefined,
    market_type: searchMarketType || undefined,
  });

  const totalPages = pageSize === -1 ? 1 : Math.ceil(total / pageSize);

  const handleSort = (field: SweepSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleViewDetails = (sweep: Sweep) => {
    setSelectedSweep(sweep);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setSelectedSweep(null);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchSlug("");
    setSearchQuestion("");
    setSearchMarketType("");
    setSortField("created_at");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if needed
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDuration = (ms: number) => {
    const hours = ms / (1000 * 60 * 60);
    return `${hours.toFixed(2)}h`;
  };

  const formatExecTime = (ms: number) => `${ms}ms`;

  const formatMarketTypeLabel = (marketType: MarketType) => {
    const labels: Record<MarketType, string> = {
      // Crypto markets
      crypto_market_15_minutes: "Crypto 15min",
      crypto_market_hourly: "Crypto Hourly",
      crypto_market_one_day: "Crypto Daily",
      crypto_market_one_week: "Crypto Weekly",
      crypto_market_monthly: "Crypto Monthly",
      crypto_market_yearly: "Crypto Yearly",
      crypto_market_other: "Crypto Other",
      // Tech markets
      tech_market_one_month: "Tech Monthly",
      tech_market_other: "Tech Other",
      // Politics markets
      politics_market_one_week: "Politics Weekly",
      politics_market_one_month: "Politics Monthly",
      politics_market_other: "Politics Other",
      // Culture markets
      culture_market_one_week: "Culture Weekly",
      culture_market_other: "Culture Other",
      // Other markets
      temperature_market_one_day: "Temperature Daily",
      earnings_market_one_week: "Earnings Weekly",
      market_default: "Default",
    };
    return labels[marketType] || marketType;
  };

  const getStatusIcon = (isSuccess: boolean) => {
    if (isSuccess) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isSuccess: boolean) => {
    return (
      <Badge variant={isSuccess ? "default" : "destructive"}>
        {isSuccess ? "Success" : "Failed"}
      </Badge>
    );
  };

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between mb-4">
          <span>Sweeps History</span>
          <div className="text-sm font-normal text-[var(--color-text-secondary)]">
            {total} total sweeps
            {totalPages > 1 && (
              <span className="ml-2">
                • Page {currentPage} of {totalPages} (
                {pageSize === -1 ? "unlimited" : `${pageSize} per page`})
              </span>
            )}
          </div>
        </CardTitle>

        {/* Search Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-xs min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Search by market slug..."
                value={searchSlug}
                onChange={(e) => setSearchSlug(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
            <div className="relative flex-1 max-w-xs min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Search by market question..."
                value={searchQuestion}
                onChange={(e) => setSearchQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
            <div className="relative flex-1 max-w-xs min-w-[200px]">
              <select
                value={searchMarketType}
                onChange={(e) =>
                  setSearchMarketType(e.target.value as MarketType | "")
                }
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
                disabled={isLoading}
              >
                <option value="">All Market Types</option>
                <optgroup label="Crypto Markets">
                  <option value="crypto_market_15_minutes">Crypto 15min</option>
                  <option value="crypto_market_hourly">Crypto Hourly</option>
                  <option value="crypto_market_one_day">Crypto Daily</option>
                  <option value="crypto_market_one_week">Crypto Weekly</option>
                  <option value="crypto_market_monthly">Crypto Monthly</option>
                  <option value="crypto_market_yearly">Crypto Yearly</option>
                  <option value="crypto_market_other">Crypto Other</option>
                </optgroup>
                <optgroup label="Tech Markets">
                  <option value="tech_market_one_month">Tech Monthly</option>
                  <option value="tech_market_other">Tech Other</option>
                </optgroup>
                <optgroup label="Politics Markets">
                  <option value="politics_market_one_week">
                    Politics Weekly
                  </option>
                  <option value="politics_market_one_month">
                    Politics Monthly
                  </option>
                  <option value="politics_market_other">Politics Other</option>
                </optgroup>
                <optgroup label="Culture Markets">
                  <option value="culture_market_one_week">
                    Culture Weekly
                  </option>
                  <option value="culture_market_other">Culture Other</option>
                </optgroup>
                <optgroup label="Other Markets">
                  <option value="temperature_market_one_day">
                    Temperature Daily
                  </option>
                  <option value="earnings_market_one_week">
                    Earnings Weekly
                  </option>
                  <option value="market_default">Default</option>
                </optgroup>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs min-w-[150px]">
                <select
                  value={sortField}
                  onChange={(e) =>
                    setSortField(e.target.value as SweepSortField)
                  }
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
                  disabled={isLoading}
                >
                  <option value="created_at">Created At</option>
                  <option value="post_order_value">Post Order Value</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {sortDirection === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                {sortDirection === "asc" ? "Asc" : "Desc"}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={isLoading}
            >
              Search
            </Button>
            {(searchSlug ||
              searchQuestion ||
              searchMarketType ||
              sortField !== "created_at" ||
              sortDirection !== "desc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                disabled={isLoading}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Market</TableHead>
                <TableHead className="w-[150px]">Question</TableHead>
                <TableHead className="w-[80px]">Market Start</TableHead>
                <TableHead className="w-[80px]">Market End</TableHead>
                <TableHead className="w-[60px]">Duration</TableHead>
                <TableHead className="w-[60px]">B.Price</TableHead>
                <TableHead className="w-[60px]">B.Size</TableHead>
                <TableHead className="w-[60px]">B.Value</TableHead>
                <TableHead className="w-[60px]">P.Price</TableHead>
                <TableHead className="w-[60px]">P.Size</TableHead>
                <TableHead className="w-[60px]">P.Value</TableHead>
                <TableHead className="w-[80px]">Exec Start</TableHead>
                <TableHead className="w-[60px]">Exec Time</TableHead>
                <TableHead className="w-[60px]">Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SweepRowSkeleton key={i} />
                ))
              ) : sweeps.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={15}
                    className="text-center py-8 text-[var(--color-text-secondary)]"
                  >
                    No sweeps found
                  </TableCell>
                </TableRow>
              ) : (
                sweeps.map((sweep: Sweep) => (
                  <TableRow key={sweep.id}>
                    {/* Market */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <img
                          src={
                            sweep?.updated_market?.icon ||
                            sweep?.market?.icon ||
                            ""
                          }
                          alt={
                            sweep?.updated_market?.question ||
                            sweep?.market?.question
                          }
                          className="h-3 w-3 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div
                          className="text-xs flex-1"
                          title={
                            sweep.updated_market?.slug || sweep.market?.slug
                          }
                        >
                          {sweep.updated_market?.slug || sweep.market?.slug}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(
                              sweep.updated_market?.slug ||
                                sweep.market?.slug ||
                                ""
                            )
                          }
                          className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                        >
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Question */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div
                          className="max-w-[120px] truncate text-xs flex-1"
                          title={sweep.market_question}
                        >
                          {sweep.market_question}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(sweep.market_question)}
                          className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                        >
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Market Start */}
                    <TableCell>
                      <div
                        className="text-xs font-mono truncate"
                        title={new Date(sweep.market_start_time).toISOString()}
                      >
                        {format(
                          new Date(sweep.market_start_time),
                          "MM/dd HH:mm"
                        )}
                      </div>
                    </TableCell>

                    {/* Market End */}
                    <TableCell>
                      <div
                        className="text-xs font-mono truncate"
                        title={new Date(sweep.market_end_time).toISOString()}
                      >
                        {new Date(sweep.market_end_time).toISOString()}
                      </div>
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        {formatDuration(sweep.market_duration)}
                      </div>
                    </TableCell>

                    {/* Big Odd Price */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        {sweep.big_odd_ask_price}
                      </div>
                    </TableCell>

                    {/* Big Odd Size */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        {sweep.big_odd_ask_size}
                      </div>
                    </TableCell>

                    {/* Big Odd Value */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        ${sweep.big_odd_ask_value.toFixed(2)}
                      </div>
                    </TableCell>

                    {/* Post Price */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        {sweep.post_order_price}
                      </div>
                    </TableCell>

                    {/* Post Size */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        {sweep.post_order_size}
                      </div>
                    </TableCell>

                    {/* Post Value */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        ${sweep.post_order_value.toFixed(2)}
                      </div>
                    </TableCell>

                    {/* Exec Start */}
                    <TableCell>
                      <div
                        className="text-xs font-mono truncate"
                        title={new Date(
                          sweep.post_order_start_time
                        ).toUTCString()}
                      >
                        {`${new Date(
                          sweep.post_order_start_time
                        ).toISOString()} ( ${formatDuration(
                          new Date().getTime() -
                            new Date(sweep.post_order_start_time).getTime()
                        )} ago)`}
                      </div>
                    </TableCell>

                    {/* Exec Time */}
                    <TableCell>
                      <div className="text-xs font-mono">
                        {formatExecTime(sweep.execution_time)}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(sweep.is_success)}
                        <span className="text-xs">
                          {sweep.is_success ? "✓" : "✗"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(sweep)}
                        className="h-5 w-5 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
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

      <SweepDetailDialog
        sweep={selectedSweep}
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
      />
    </Card>
  );
}
