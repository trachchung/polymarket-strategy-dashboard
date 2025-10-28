import { AppLayout } from "@/components/layout/app-layout";
import { UserDailyMetricsTable } from "@/components/dashboard/user-daily-metrics-table";

export default function UserMetricsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">User Daily Metrics</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Track daily trading performance for individual users
          </p>
        </div>
        <UserDailyMetricsTable />
      </div>
    </AppLayout>
  );
}
