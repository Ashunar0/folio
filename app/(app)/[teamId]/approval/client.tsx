"use client";

import { DataTable } from "@/components/data-table";
import { approvalColumns } from "./columns";
import { Expense } from "@/lib/schemas";
import { ApprovalSheet } from "@/components/sheets/approval-sheet";
import { useState } from "react";
import { useApprovalList } from "@/lib/api/approvals";
import { useAuth } from "@/providers/auth-provider";
import { useTeam } from "@/providers/team-provider";
import { DestructiveAlert } from "@/components/ui/alert-toast";

export default function ApprovalClient() {
  const { authLoading } = useAuth();
  const { teamId, loadingTeams, currentTeamRole } = useTeam();
  const { data, isLoading, error } = useApprovalList();
  const canApprove = ["admin", "manager"].includes(currentTeamRole ?? "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleRowClick = (row: Expense) => {
    setSelectedExpense(row);
    setIsSheetOpen(true);
  };

  const handleReview = (row: Expense) => {
    setSelectedExpense(row);
    setIsSheetOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">Approval List</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your approvals.
        </p>
      </div>
      {(authLoading || loadingTeams || isLoading) && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}
      {error && (
        <DestructiveAlert
          title="Failed to load approvals"
          description={error.message}
        />
      )}
      {!teamId && !loadingTeams && (
        <p className="text-sm text-muted-foreground">
          No team selected. Join or create a team.
        </p>
      )}
      <DataTable
        data={data ?? []}
        columns={approvalColumns}
        onRowClick={handleRowClick}
        meta={{
          onEdit: handleReview,
        }}
      />
      <ApprovalSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expense={selectedExpense}
        canApprove={canApprove}
      />
    </div>
  );
}
