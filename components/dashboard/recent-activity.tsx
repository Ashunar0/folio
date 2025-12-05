"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/lib/api/transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useTeam } from "@/providers/team-provider";

function formatCurrency(value: number) {
  return `¥${Math.abs(value).toLocaleString()}`;
}

function ListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivity() {
  const { data: transactions, isLoading } = useTransactions();
  const { teamId } = useTeam();

  if (isLoading) {
    return <ListSkeleton />;
  }

  const recentItems = (transactions ?? []).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${teamId}/transactions`}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentItems.length > 0 ? (
          <div className="space-y-4">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  {item.type === "expense" ? (
                    <IconArrowDownRight className="h-4 w-4 text-red-500" />
                  ) : (
                    <IconArrowUpRight className="h-4 w-4 text-emerald-500" />
                  )}
                  <div>
                    <div className="font-medium">{item.category}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(item.date), "M/d")} · {item.createdBy}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-medium ${
                    item.type === "expense"
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {item.type === "expense" ? "-" : "+"}
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No transaction data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
