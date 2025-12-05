"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconWallet,
  IconClockHour4,
} from "@tabler/icons-react";
import {
  useDashboardSummary,
  useTotalBalance,
  type MonthlySummary,
  type TotalBalance,
} from "@/lib/api/dashboard";
import { useApprovalList } from "@/lib/api/approvals";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(value: number) {
  return `¥${Math.abs(value).toLocaleString()}`;
}

function ChangeIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  return (
    <span
      className={`text-xs ${isPositive ? "text-red-500" : "text-emerald-500"}`}
    >
      {isPositive ? "+" : ""}
      {change.toFixed(0)}% vs 先月
    </span>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export function SummaryCards() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: totalBalance, isLoading: totalLoading } = useTotalBalance();
  const { data: approvals, isLoading: approvalsLoading } = useApprovalList();

  if (summaryLoading || approvalsLoading || totalLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    );
  }

  const s = summary as MonthlySummary | undefined;
  const t = totalBalance as TotalBalance | undefined;
  const pendingCount = approvals?.length ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 収支合計（総資産） */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <IconWallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (t?.totalBalance ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {(t?.totalBalance ?? 0) >= 0 ? "" : "-"}
            {formatCurrency(t?.totalBalance ?? 0)}
          </div>
        </CardContent>
      </Card>

      {/* 今月の支出 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            This Month's Expense
          </CardTitle>
          <IconArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(s?.totalExpense ?? 0)}
          </div>
          <ChangeIndicator
            current={s?.totalExpense ?? 0}
            previous={s?.prevMonthExpense ?? 0}
          />
        </CardContent>
      </Card>

      {/* 今月の収入 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            This Month's Income
          </CardTitle>
          <IconArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(s?.totalIncome ?? 0)}
          </div>
          <ChangeIndicator
            current={s?.totalIncome ?? 0}
            previous={s?.prevMonthIncome ?? 0}
          />
        </CardContent>
      </Card>

      {/* 承認待ち */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Approvals
          </CardTitle>
          <IconClockHour4 className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}件</div>
          <span className="text-xs text-muted-foreground">
            Pending Approvals
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
