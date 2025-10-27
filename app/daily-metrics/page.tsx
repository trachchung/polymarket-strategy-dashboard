import { AppLayout } from "@/components/layout/app-layout";
import { DailyMetricsTable } from "@/components/dashboard/daily-metrics-table";

export default function DailyMetricsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Trading Metrics</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Track your trading performance across different days
          </p>
        </div>
        <DailyMetricsTable />
      </div>
    </AppLayout>
  );
}
