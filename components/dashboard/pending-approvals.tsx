"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApprovalList } from "@/lib/api/approvals";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PendingApprovals() {
  const { data: approvals, isLoading } = useApprovalList();
  const { teamId } = useTeam();

  if (isLoading) {
    return <ListSkeleton />;
  }

  const pendingItems = (approvals ?? []).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Approvals</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${teamId}/approval`}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {pendingItems.length > 0 ? (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium">{item.category}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(item.date), "M/d")} · {item.createdBy}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-red-600">
                    {formatCurrency(item.amount)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-300"
                  >
                    Pending Approval
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No pending approvals
          </div>
        )}
      </CardContent>
    </Card>
  );
}
