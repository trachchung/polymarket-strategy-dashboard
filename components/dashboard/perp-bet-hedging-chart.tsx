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

// Default constants from the specification
const DEFAULT_C_POLYM = 5000; // Polymarket Capital
const DEFAULT_C_PERP = 50000; // Perpdex Leveraged Position Size (after leverage applied)
const DEFAULT_B_ENTRY = 104370; // Perpdex Short Entry Price
const B_COND = 104000; // Polymarket Condition Price

// Yes Odds to plot
const YES_ODDS = [0.30, 0.50, 0.63, 0.80];

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
  return cPolym * ((resolveOdd / entryOdd) - 1);
}

// Calculate Perpdex Short P&L
// cPerp is the leveraged position size (already includes leverage)
function calculatePerpdexPnL(
  finalPrice: number,
  cPerp: number,
  bEntry: number
): number {
  return cPerp * ((bEntry - finalPrice) / bEntry);
}

// Calculate Total Net P&L
function calculateNetPnL(
  finalPrice: number,
  entryOdd: number,
  resolveOdd: number,
  cPolym: number,
  cPerp: number,
  bEntry: number
): number {
  const polymPnL = calculatePolymarketPnL(finalPrice, entryOdd, resolveOdd, cPolym);
  const perpPnL = calculatePerpdexPnL(finalPrice, cPerp, bEntry);
  return polymPnL + perpPnL;
}

// Generate data points
function generateData(
  cPolym: number,
  cPerp: number,
  bEntry: number,
  entryOdd: number,
  resolveOdd: number | null // null means use final price resolution (1.0 or 0.0)
) {
  const data: Array<{
    price: number;
    [key: string]: number | string;
  }> = [];

  // Generate price points from $85,000 to $130,000
  // Include specific points around the cliff
  const pricePoints = new Set<number>([
    85000,
    103999.99,
    104000.01,
    130000,
  ]);

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

    // Plot all default odds (using them as entry odds)
    YES_ODDS.forEach((odd) => {
      dataPoint[`odd_${odd}`] = calculateNetPnL(
        price,
        odd, // entry odd
        currentResolveOdd, // resolve odd
        cPolym,
        cPerp,
        bEntry
      );
    });

    // Also plot the selected entry odd if it's not in the default set
    const selectedOddKey = `odd_${entryOdd}`;
    if (!YES_ODDS.includes(entryOdd)) {
      dataPoint[selectedOddKey] = calculateNetPnL(
        price,
        entryOdd, // entry odd
        currentResolveOdd, // resolve odd
        cPolym,
        cPerp,
        bEntry
      );
    }

    data.push(dataPoint);
  });

  return data;
}

export function PerpBetHedgingChart() {
  // State for adjustable parameters
  const [cPolym, setCPolym] = useState(DEFAULT_C_POLYM);
  const [cPerp, setCPerp] = useState(DEFAULT_C_PERP);
  const [bEntry, setBEntry] = useState(DEFAULT_B_ENTRY);
  const [entryOdd, setEntryOdd] = useState(0.50);
  const [resolveOdd, setResolveOdd] = useState<number | null>(null); // null = use final price resolution

  const data = useMemo(
    () => generateData(cPolym, cPerp, bEntry, entryOdd, resolveOdd),
    [cPolym, cPerp, bEntry, entryOdd, resolveOdd]
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
        <div className="rounded-lg border bg-[var(--color-surface)] p-3 shadow-lg">
          <p className="mb-2 font-semibold">{`Final BTC Price: ${formatPrice(
            label
          )}`}</p>
          {payload.map((entry: any, index: number) => {
            // Extract odd from dataKey (format: "odd_0.50")
            const odd = entry.dataKey?.replace("odd_", "") || "N/A";
            return (
              <p
                key={index}
                className="text-sm"
                style={{ color: entry.color }}
              >
                {`Entry ${odd}: ${formatCurrency(entry.value)}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Strategy P&L vs. Final BTC Price (Based on 'Yes' Odd)
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Visualizing the hedging strategy profitability across different price
          scenarios
        </p>
      </div>

      {/* Slider Controls */}
      <div className="mb-6 space-y-6 rounded-lg border bg-[var(--color-surface-elevated)] p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Polymarket Capital: {formatCurrency(cPolym)}
              </label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Perpdex Position Size (After Leverage): {formatCurrency(cPerp)}
              </label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Perp Entry Price: {formatPrice(bEntry)}
              </label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Entry Odd (Buy Price): {entryOdd.toFixed(2)} ({Math.round(entryOdd * 100)}%)
              </label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Resolve Odd (Sell Price):{" "}
                {resolveOdd === null
                  ? "Auto (Based on Final Price)"
                  : `${resolveOdd.toFixed(2)} (${Math.round(resolveOdd * 100)}%)`}
              </label>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="use-auto-resolve"
                checked={resolveOdd === null}
                onChange={(e) => setResolveOdd(e.target.checked ? null : 0.5)}
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              <label
                htmlFor="use-auto-resolve"
                className="text-sm text-[var(--color-text-secondary)] cursor-pointer"
              >
                Use final price resolution (1.0 if win, 0.0 if lose)
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
        </div>
      </div>

      <ResponsiveContainer width="100%" height={600}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="price"
            type="number"
            domain={[85000, 130000]}
            tickFormatter={formatPrice}
            label={{
              value: "Final BTC Price ($)",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            label={{
              value: "Total Net P&L ($)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip content={customTooltip} />
          <Legend
            formatter={(value) => {
              if (value.startsWith("Entry ")) {
                return value;
              }
              const odd = value.replace("odd_", "");
              return `Entry ${odd}`;
            }}
          />

          {/* Reference Lines */}
          <ReferenceLine
            x={B_COND}
            stroke="red"
            strokeDasharray="5 5"
            label={{ value: "Polymarket Cliff", position: "top" }}
          />
          <ReferenceLine
            x={bEntry}
            stroke="green"
            strokeDasharray="5 5"
            label={{ value: "Perp Entry", position: "top" }}
          />
          <ReferenceLine
            y={0}
            stroke="black"
            strokeDasharray="5 5"
            label={{ value: "Break-Even", position: "right" }}
          />

          {/* Data Lines for each Entry Odd */}
          {YES_ODDS.map((odd, index) => {
            const isSelected = Math.abs(odd - entryOdd) < 0.01;
            return (
              <Line
                key={odd}
                type="monotone"
                dataKey={`odd_${odd}`}
                stroke={colors[index]}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isSelected ? undefined : "5 5"}
                opacity={isSelected ? 1 : 0.6}
                dot={false}
                name={`Entry ${odd}`}
              />
            );
          })}
          {/* Plot selected entry odd as a separate line if it's not in the default set */}
          {!YES_ODDS.includes(entryOdd) && (
            <Line
              type="monotone"
              dataKey={`odd_${entryOdd}`}
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={false}
              name={`Entry ${entryOdd}`}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h3 className="font-semibold">Current Strategy Parameters</h3>
          <div className="space-y-1 text-[var(--color-text-secondary)]">
            <p>Polymarket Capital: {formatCurrency(cPolym)}</p>
            <p>Perpdex Position Size (After Leverage): {formatCurrency(cPerp)}</p>
            <p>Perp Entry Price: {formatPrice(bEntry)}</p>
            <p>Polymarket Condition: {formatPrice(B_COND)}</p>
            <p>Entry Odd: {entryOdd.toFixed(2)}</p>
            <p>
              Resolve Odd:{" "}
              {resolveOdd === null
                ? "Auto (Based on Final Price)"
                : resolveOdd.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">How to Read</h3>
          <div className="space-y-1 text-[var(--color-text-secondary)]">
            <p>
              • Each line represents a different "Yes" odd price paid for the
              Polymarket contract
            </p>
            <p>
              • The red dashed line shows where the Polymarket bet condition
              triggers
            </p>
            <p>
              • The green dashed line shows the Perpdex short entry price
            </p>
            <p>
              • Positive values indicate profit; negative values indicate loss
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

