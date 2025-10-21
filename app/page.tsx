import { AppLayout } from "@/components/layout/app-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SweepsTable } from "@/components/dashboard/sweeps-table";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sweeps Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Real-time sweeps performance and execution history
          </p>
        </div>

        <SummaryCards />
        <SweepsTable />
      </div>
    </AppLayout>
  );
}
