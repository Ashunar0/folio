"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

const MonthlyChart = dynamic(
  () =>
    import("@/components/dashboard/monthly-chart").then(
      (mod) => mod.MonthlyChart
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Monthly Trend" />,
  }
);

const CategoryPie = dynamic(
  () =>
    import("@/components/dashboard/category-pie").then((mod) => mod.CategoryPie),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Category Breakdown" />,
  }
);

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
