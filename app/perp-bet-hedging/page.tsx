import { AppLayout } from "@/components/layout/app-layout";
import { PerpBetHedgingChart } from "@/components/dashboard/perp-bet-hedging-chart";

export default function PerpBetHedgingPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Perp Bet Hedging Strategy
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Analyze the profitability of a hedging strategy combining Polymarket
            prediction bets with Perpdex futures positions
          </p>
        </div>
        <PerpBetHedgingChart />
      </div>
    </AppLayout>
  );
}

