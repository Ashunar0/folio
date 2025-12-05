"use client";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { CategoryPie } from "@/components/dashboard/category-pie";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";

export default function DashboardClient() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          View your dashboard to see your financial data.
        </p>
      </div>

      {/* サマリーカード */}
      <SummaryCards />

      {/* グラフエリア */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyChart />
        <CategoryPie />
      </div>

      {/* アクティビティ・承認待ち */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <PendingApprovals />
      </div>
    </section>
  );
}
