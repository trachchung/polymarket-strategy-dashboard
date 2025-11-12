"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Percent,
  Settings2,
  Info,
} from "lucide-react";

// Default constants from the specification
const DEFAULT_C_POLYM = 5000; // Polymarket Capital
const DEFAULT_C_PERP = 50000; // Perpdex Leveraged Position Size (after leverage applied)
const DEFAULT_B_ENTRY = 104370; // Perpdex Short Entry Price
const B_COND = 104000; // Polymarket Condition Price

// Calculate Polymarket P&L
// entryOdd: the odd when the bet is placed (buy price)
// resolveOdd: the odd when the bet ends or sold early (already determined in generateData)
// Formula: P&L = Capital * ((resolveOdd / entryOdd) - 1)
// This works for both:
//   - Full resolution: resolveOdd = 1.0 (win) or 0.0 (lose)
//   - Early selling: resolveOdd = sell price
function calculatePolymarketPnL(
  finalPrice: number,
  entryOdd: number,
  resolveOdd: number,
  cPolym: number
): number {
  // Handle edge case where entryOdd is 0 to avoid division by zero
  if (entryOdd <= 0) {
    return 1000000; // Large finite number for chart rendering
  }

  // Calculate P&L based on entry and resolve odds
  // You buy at entryOdd, sell/resolve at resolveOdd
  // Profit per share = resolveOdd - entryOdd
  // Number of shares = Capital / entryOdd
  // Total P&L = (resolveOdd - entryOdd) * (Capital / entryOdd) = Capital * (resolveOdd / entryOdd - 1)
  return cPolym * (resolveOdd / entryOdd - 1);
}

// Calculate Perpdex Short P&L
// cPerp is the leveraged position size (already includes leverage)
// stopLoss: price level above entry where position is closed (for short, loss occurs when price goes up)
// takeProfit: price level below entry where position is closed (for short, profit occurs when price goes down)
function calculatePerpdexPnL(
  finalPrice: number,
  cPerp: number,
  bEntry: number,
  stopLoss: number | null,
  takeProfit: number | null
): number {
  // Determine the effective exit price based on stop loss and take profit
  let exitPrice = finalPrice;

  // For a short position:
  // - Stop loss triggers if price goes above stopLoss (price rises, we lose)
  // - Take profit triggers if price goes below takeProfit (price falls, we profit)

  if (stopLoss !== null && finalPrice >= stopLoss) {
    // Stop loss triggered - position closed at stop loss price
    exitPrice = stopLoss;
  } else if (takeProfit !== null && finalPrice <= takeProfit) {
    // Take profit triggered - position closed at take profit price
    exitPrice = takeProfit;
  }

  return cPerp * ((bEntry - exitPrice) / bEntry);
}

// Calculate Total Net P&L
function calculateNetPnL(
  finalPrice: number,
  entryOdd: number,
  resolveOdd: number,
  cPolym: number,
  cPerp: number,
  bEntry: number,
  stopLoss: number | null,
  takeProfit: number | null
): number {
  const polymPnL = calculatePolymarketPnL(
    finalPrice,
    entryOdd,
    resolveOdd,
    cPolym
  );
  const perpPnL = calculatePerpdexPnL(
    finalPrice,
    cPerp,
    bEntry,
    stopLoss,
    takeProfit
  );
  return polymPnL + perpPnL;
}

// Generate data points
function generateData(
  cPolym: number,
  cPerp: number,
  bEntry: number,
  entryOdd: number,
  resolveOdd: number | null, // null means use final price resolution (1.0 or 0.0)
  stopLoss: number | null,
  takeProfit: number | null
) {
  const data: Array<{
    price: number;
    [key: string]: number | string;
  }> = [];

  // Generate price points from $85,000 to $130,000
  // Include specific points around the cliff
  const pricePoints = new Set<number>([85000, 103999.99, 104000.01, 130000]);

  // Add more points for smooth curves
  for (let price = 85000; price <= 130000; price += 500) {
    pricePoints.add(price);
  }

  // Add extra points around critical areas
  for (let price = 103500; price <= 104500; price += 50) {
    pricePoints.add(price);
  }

  const sortedPrices = Array.from(pricePoints).sort((a, b) => a - b);

  sortedPrices.forEach((price) => {
    const dataPoint: {
      price: number;
      [key: string]: number | string;
    } = {
      price,
    };

    // Determine resolve odd for this price point
    // If resolveOdd is null, use final price resolution (1.0 if win, 0.0 if lose)
    // Otherwise, use the provided resolveOdd (for early selling scenarios)
    let currentResolveOdd: number;
    if (resolveOdd === null) {
      // Use final price resolution
      currentResolveOdd = price > B_COND ? 1.0 : 0.0;
    } else {
      // Use provided resolve odd (early sell scenario)
      currentResolveOdd = resolveOdd;
    }

    // Plot the selected entry odd
    const selectedOddKey = `odd_${entryOdd}`;
    dataPoint[selectedOddKey] = calculateNetPnL(
      price,
      entryOdd, // entry odd
      currentResolveOdd, // resolve odd
      cPolym,
      cPerp,
      bEntry,
      stopLoss,
      takeProfit
    );

    data.push(dataPoint);
  });

  return data;
}

export function PerpBetHedgingChart() {
  // State for adjustable parameters
  const [cPolym, setCPolym] = useState(DEFAULT_C_POLYM);
  const [cPerp, setCPerp] = useState(DEFAULT_C_PERP);
  const [bEntry, setBEntry] = useState(DEFAULT_B_ENTRY);
  const [entryOdd, setEntryOdd] = useState(0.5);
  const [resolveOdd, setResolveOdd] = useState<number | null>(null); // null = use final price resolution
  const [stopLoss, setStopLoss] = useState<number | null>(null); // null = no stop loss
  const [takeProfit, setTakeProfit] = useState<number | null>(null); // null = no take profit

  const data = useMemo(
    () =>
      generateData(
        cPolym,
        cPerp,
        bEntry,
        entryOdd,
        resolveOdd,
        stopLoss,
        takeProfit
      ),
    [cPolym, cPerp, bEntry, entryOdd, resolveOdd, stopLoss, takeProfit]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-2xl backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
            <BarChart3 className="h-4 w-4 text-[var(--color-primary)]" />
            <p className="font-semibold text-[var(--color-text-primary)]">
              {formatPrice(label)}
            </p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const odd = entry.dataKey?.replace("odd_", "") || "N/A";
              const value = entry.value as number;
              const isPositive = value > 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-lg bg-[var(--color-surface)] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Entry {odd}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isPositive
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {formatCurrency(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-lg">
      {/* Header Section */}
      <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface-elevated)] to-[var(--color-surface)] px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-[var(--color-primary)]/10 p-2">
                <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Strategy P&L Analysis
              </h2>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] ml-14">
              Visualizing hedging strategy profitability across different BTC
              price scenarios and entry odds
            </p>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Strategy Parameters
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Polymarket Capital
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {formatCurrency(cPolym)}
              </div>
            </div>
            <Slider
              value={[cPolym]}
              onValueChange={(value) => setCPolym(value[0])}
              min={1000}
              max={20000}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>{formatCurrency(1000)}</span>
              <span>{formatCurrency(20000)}</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Perpdex Position Size
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {formatCurrency(cPerp)}
              </div>
            </div>
            <Slider
              value={[cPerp]}
              onValueChange={(value) => setCPerp(value[0])}
              min={10000}
              max={200000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>{formatCurrency(10000)}</span>
              <span>{formatCurrency(200000)}</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-warning)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Perp Entry Price
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {formatPrice(bEntry)}
              </div>
            </div>
            <Slider
              value={[bEntry]}
              onValueChange={(value) => setBEntry(value[0])}
              min={90000}
              max={120000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>{formatPrice(90000)}</span>
              <span>{formatPrice(120000)}</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-[var(--color-accent)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Entry Odd (Buy Price)
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {entryOdd.toFixed(2)}{" "}
                <span className="text-sm text-[var(--color-text-secondary)]">
                  ({Math.round(entryOdd * 100)}%)
                </span>
              </div>
            </div>
            <Slider
              value={[entryOdd]}
              onValueChange={(value) => setEntryOdd(value[0])}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>0.00 (0%)</span>
              <span>1.00 (100%)</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-[var(--color-primary)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Resolve Odd (Sell Price)
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {resolveOdd === null
                  ? "Auto"
                  : `${resolveOdd.toFixed(2)} (${Math.round(
                      resolveOdd * 100
                    )}%)`}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-2">
              <input
                type="checkbox"
                id="use-auto-resolve"
                checked={resolveOdd === null}
                onChange={(e) => setResolveOdd(e.target.checked ? null : 0.5)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <label
                htmlFor="use-auto-resolve"
                className="text-xs text-[var(--color-text-secondary)] cursor-pointer"
              >
                Auto-resolve based on final price
              </label>
            </div>
            {resolveOdd !== null && (
              <>
                <Slider
                  value={[resolveOdd]}
                  onValueChange={(value) => setResolveOdd(value[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
                  <span>0.00 (0%)</span>
                  <span>1.00 (100%)</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-danger)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Stop Loss (Perp)
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {stopLoss === null ? "Disabled" : formatPrice(stopLoss)}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-2">
              <input
                type="checkbox"
                id="use-stop-loss"
                checked={stopLoss !== null}
                onChange={(e) =>
                  setStopLoss(e.target.checked ? bEntry * 1.05 : null)
                }
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-danger)]"
              />
              <label
                htmlFor="use-stop-loss"
                className="text-xs text-[var(--color-text-secondary)] cursor-pointer"
              >
                Enable stop loss (closes short if price rises above this level)
              </label>
            </div>
            {stopLoss !== null && (
              <>
                <Slider
                  value={[stopLoss]}
                  onValueChange={(value) => setStopLoss(value[0])}
                  min={bEntry}
                  max={bEntry * 1.2}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
                  <span>{formatPrice(bEntry)}</span>
                  <span>{formatPrice(bEntry * 1.2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Take Profit (Perp)
              </label>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2">
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {takeProfit === null ? "Disabled" : formatPrice(takeProfit)}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-2">
              <input
                type="checkbox"
                id="use-take-profit"
                checked={takeProfit !== null}
                onChange={(e) =>
                  setTakeProfit(e.target.checked ? bEntry * 0.95 : null)
                }
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-success)]"
              />
              <label
                htmlFor="use-take-profit"
                className="text-xs text-[var(--color-text-secondary)] cursor-pointer"
              >
                Enable take profit (closes short if price falls below this
                level)
              </label>
            </div>
            {takeProfit !== null && (
              <>
                <Slider
                  value={[takeProfit]}
                  onValueChange={(value) => setTakeProfit(value[0])}
                  min={bEntry * 0.8}
                  max={bEntry}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
                  <span>{formatPrice(bEntry * 0.8)}</span>
                  <span>{formatPrice(bEntry)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="px-6 py-6">
        <ResponsiveContainer width="100%" height={650}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <defs>
              <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-success)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-success)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="gradientLoss" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-danger)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-danger)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="price"
              type="number"
              domain={[85000, 130000]}
              tickFormatter={formatPrice}
              stroke="var(--color-primary)"
              strokeWidth={2}
              tick={{
                fill: "var(--color-text-primary)",
                fontSize: 13,
                fontWeight: 600,
              }}
              label={{
                value: "Final BTC Price ($)",
                position: "insideBottom",
                offset: -10,
                style: {
                  textAnchor: "middle",
                  fill: "var(--color-primary)",
                  fontSize: 15,
                  fontWeight: 700,
                },
              }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="var(--color-text-tertiary)"
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              label={{
                value: "Total Net P&L ($)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "var(--color-text-primary)",
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
            <Tooltip content={customTooltip} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
              formatter={(value) => {
                if (value.startsWith("Entry ")) {
                  return value;
                }
                const odd = value.replace("odd_", "");
                return `Entry ${odd}`;
              }}
              style={{
                color: "var(--color-text-primary)",
                fontSize: "12px",
              }}
            />

            {/* Reference Lines */}
            <ReferenceLine
              x={B_COND}
              stroke="var(--color-danger)"
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                value: `Polymarket Cliff (${formatPrice(B_COND)})`,
                position: "top",
                fill: "var(--color-danger)",
                fontSize: 12,
                fontWeight: 600,
                offset: 10,
              }}
            />
            <ReferenceLine
              x={bEntry}
              stroke="var(--color-success)"
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                value: `Perp Entry (${formatPrice(bEntry)})`,
                position: "top",
                fill: "var(--color-success)",
                fontSize: 12,
                fontWeight: 600,
                offset: 10,
              }}
            />
            <ReferenceLine
              y={0}
              stroke="var(--color-text-tertiary)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{
                value: "Break-Even",
                position: "right",
                fill: "var(--color-text-secondary)",
                fontSize: 11,
                offset: 10,
              }}
            />

            {/* Stop Loss Reference Line */}
            {stopLoss !== null && (
              <ReferenceLine
                x={stopLoss}
                stroke="var(--color-danger)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `Stop Loss (${formatPrice(stopLoss)})`,
                  position: "top",
                  fill: "var(--color-danger)",
                  fontSize: 11,
                  fontWeight: 500,
                  offset: 10,
                }}
              />
            )}

            {/* Take Profit Reference Line */}
            {takeProfit !== null && (
              <ReferenceLine
                x={takeProfit}
                stroke="var(--color-success)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `Take Profit (${formatPrice(takeProfit)})`,
                  position: "bottom",
                  fill: "var(--color-success)",
                  fontSize: 11,
                  fontWeight: 500,
                  offset: 10,
                }}
              />
            )}

            {/* Data Line for selected Entry Odd */}
            <Line
              type="monotone"
              dataKey={`odd_${entryOdd}`}
              stroke="var(--color-primary)"
              strokeWidth={3.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name={`Entry ${entryOdd}`}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Info Section */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                Current Strategy Parameters
              </h3>
            </div>
            <div className="space-y-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Polymarket Capital
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatCurrency(cPolym)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Perpdex Position Size
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatCurrency(cPerp)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Perp Entry Price
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatPrice(bEntry)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Polymarket Condition
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatPrice(B_COND)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Entry Odd
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {entryOdd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Resolve Odd
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {resolveOdd === null ? "Auto" : resolveOdd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Stop Loss (Perp)
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {stopLoss === null ? "Disabled" : formatPrice(stopLoss)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Take Profit (Perp)
                </span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {takeProfit === null ? "Disabled" : formatPrice(takeProfit)}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                How to Read This Chart
              </h3>
            </div>
            <div className="space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  The blue line shows the P&L for your selected entry odd
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  The red dashed line shows where the Polymarket bet condition
                  triggers (cliff)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  The green dashed line shows the Perpdex short entry price
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-text-tertiary)]" />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Positive values indicate profit; negative values indicate loss
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  The highlighted x-axis shows the Final BTC Price range
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
