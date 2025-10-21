"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sweep } from "@/lib/types";

interface SweepDetailDialogProps {
  sweep: Sweep | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SweepDetailDialog({
  sweep,
  isOpen,
  onClose,
}: SweepDetailDialogProps) {
  if (!sweep) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "MMM dd, yyyy HH:mm:ss");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-screen max-h-screen m-0 rounded-none overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Sweep Details</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto h-full pb-6 px-10">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Sweep ID:
                  </span>
                  <span className="font-mono">{sweep.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Market ID:
                  </span>
                  <span className="font-mono">{sweep.market_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Status:
                  </span>
                  <Badge variant={sweep.is_success ? "default" : "destructive"}>
                    {sweep.is_success ? "Success" : "Failed"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Created:
                  </span>
                  <span>{formatTimestamp(sweep.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Updated:
                  </span>
                  <span>{formatTimestamp(sweep.updated_at)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Execution Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Execution Time:
                  </span>
                  <span>{formatDuration(sweep.execution_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Execute Start Time:
                  </span>
                  <span>{formatTimestamp(sweep.post_order_start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Success Count:
                  </span>
                  <span>{sweep.sucess_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Post Order Start:
                  </span>
                  <span>{formatTimestamp(sweep.post_order_start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Post Order End:
                  </span>
                  <span>{formatTimestamp(sweep.post_order_end_time)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Market Information</h3>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={sweep.updated_market?.icon || sweep.market.icon || ""}
                  alt={sweep.updated_market?.question || sweep.market.question}
                  className="h-8 w-8 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <h4 className="font-medium">
                    {sweep.updated_market?.question || sweep.market.question}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {sweep.updated_market?.slug || sweep.market?.slug}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--color-text-secondary)]">
                    Market Type:
                  </span>
                  <p className="font-medium">
                    {sweep.market_config.market_type}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">
                    Market Duration:
                  </span>
                  <p className="font-medium">
                    {formatDuration(sweep.market_duration)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">
                    Market Start:
                  </span>
                  <p className="font-medium">
                    {formatTimestamp(
                      new Date(sweep.market_start_time).toISOString()
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">
                    Market End:
                  </span>
                  <p className="font-medium">
                    {formatTimestamp(
                      new Date(sweep.market_end_time).toISOString()
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Big Odd Ask</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Size:
                    </span>
                    <span className="font-mono">{sweep.big_odd_ask_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Price:
                    </span>
                    <span className="font-mono">{sweep.big_odd_ask_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Value:
                    </span>
                    <span className="font-mono">
                      {formatCurrency(sweep.big_odd_ask_value)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Post Order</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Size:
                    </span>
                    <span className="font-mono">{sweep.post_order_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Price:
                    </span>
                    <span className="font-mono">{sweep.post_order_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">
                      Value:
                    </span>
                    <span className="font-mono">
                      {formatCurrency(sweep.post_order_value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orderbook Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Orderbook Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <h4 className="font-medium mb-3">Big Odd Ask Orderbook</h4>
                <div className="space-y-1 text-sm">
                  {sweep.big_odd_ask_orderbook.map((order, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-mono">{order.size}</span>
                      <span className="font-mono">{order.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <h4 className="font-medium mb-3">Small Odd Ask Orderbook</h4>
                <div className="space-y-1 text-sm">
                  {sweep.small_odd_ask_orderbook.map((order, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-mono">{order.size}</span>
                      <span className="font-mono">{order.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Token Orders */}
          {sweep.token_to_post_orders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Token Orders</h3>
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Side</th>
                        <th className="text-left py-2">Price</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">Order Type</th>
                        <th className="text-left py-2">Token ID</th>
                        <th className="text-left py-2">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sweep.token_to_post_orders.map((order, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{order.side}</td>
                          <td className="py-2 font-mono">{order.price}</td>
                          <td className="py-2 font-mono">{order.amount}</td>
                          <td className="py-2">{order.order_type}</td>
                          <td className="py-2 font-mono text-xs">
                            {order.token_id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Post Order Errors */}
          {sweep.token_to_post_orders.some((order) => order.error) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Post Order Errors</h3>
              <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                <div className="space-y-2">
                  {sweep.token_to_post_orders
                    .filter((order) => order.error)
                    .map((order, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-red-800">
                            Order {index + 1}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        </div>
                        <div className="text-sm text-red-700">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <span className="font-medium">Side:</span>{" "}
                              {order.side}
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span>{" "}
                              {order.amount}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span>{" "}
                              {order.price}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {order.order_type}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium">Error:</span>
                            <p className="mt-1 font-mono text-xs bg-red-100 p-2 rounded">
                              {order.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
