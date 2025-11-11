# AI Prompt: Generate P&L Simulation for a Crypto Hedging Strategy

## 1. Context & Goal

I am analyzing a crypto hedging strategy and need to visualize its profitability. The strategy consists of two positions:

1.  **Polymarket (Prediction Bet):** A **"Yes"** bet on "Bitcoin price > $104,000 on Nov 11". The capital is committed, and the "Yes" odd is an adjustable variable.
2.  **Perpdex (Futures Hedge):** A **"Short"** position on a BTC perpetual futures contract to hedge against the Polymarket bet failing (i.e., price going down).

The goal is to generate the core formulas and a multi-line P&L graph showing how the strategy's total net profit changes based on two key inputs:

1.  The **Final BTC Price** at resolution (X-axis).
2.  The **"Yes" Odd** (price) paid for the Polymarket contract (Y-axis, with multiple lines).

## 2. Key Variables (Constants)

- **Polymarket Capital ($C_{polym}$):** $5,000
- **Perpdex Margin ($C_{perpdex}$):** $5,000
- **Perpdex Leverage ($L$):** 10x
- **Perpdex Short Entry Price ($B_{entry}$):** $104,370
- **Polymarket Condition Price ($B_{cond}$):** $104,000

## 3. Core Formulas

You must use the following formulas to calculate the P&L for any given `Final_BTC_Price` and `Poly_Yes_Odd`.

### Formula 1: Polymarket P&L ($P_{polym}$)

This has a "cliff" at the condition price ($B_{cond}$).

- **If `Final_BTC_Price` > $B_{cond}$ (Bet Wins):**
  `P_polym = C_polym * ( (1 / Poly_Yes_Odd) - 1 )`
- **If `Final_BTC_Price` <= $B_{cond}$ (Bet Loses):**
  `P_polym = -C_polym`

### Formula 2: Perpdex Short P&L ($P_{perp}$)

This is a standard futures P&L calculation.

- `P_perp = C_perpdex * L * ( (B_entry - Final_BTC_Price) / B_entry )`

### Formula 3: Total Net P&L ($P_{net}$)

This is the sum of both positions.

- `P_net = P_polym + P_perp`

## 4. Graph Generation Task

### Step 1: Generate Data

Simulate the `P_net` (Total Net P&L) for the following scenarios:

- **X-Axis (Final BTC Price):** Iterate from `$85,000` to `$130,000`. You MUST include data points exactly at `$103,999.99` and `$104,000.01` to show the "cliff" sharply.
- **Lines (Scenarios):** Generate a separate line for each of these adjustable "Yes" Odds:
  - Line 1: `Poly_Yes_Odd = 0.30` (30%)
  - Line 2: `Poly_Yes_Odd = 0.50` (50%)
  - Line 3: `Poly_Yes_Odd = 0.63` (63%)
  - Line 4: `Poly_Yes_Odd = 0.80` (80%)

### Step 2: Plot the Graph

Render a 2D line chart with the following features:

- **Title:** "Strategy P&L vs. Final BTC Price (Based on 'Yes' Odd)"
- **X-Axis:** "Final BTC Price ($)"
- **Y-Axis:** "Total Net P&L ($)"
- **Legend:** Clearly label each line with its corresponding "Yes" Odd (e.g., "Odd 0.30", "Odd 0.50").
- **Reference Line 1 (Red, Dashed):** A vertical line at `x = $104,000`. Label it "Polymarket Cliff".
- **Reference Line 2 (Green, Dashed):** A vertical line at `x = $104,370`. Label it "Perp Entry".
- **Reference Line 3 (Black, Dashed):** A horizontal line at `y = $0`. Label it "Break-Even".
- **Tooltips:** On hover, show the Final BTC Price and the Net P&L for all four scenarios at that price point.
