"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Expense } from "@/lib/schemas";
import { useExpenses } from "@/lib/api/expenses";
import { useAuth } from "@/providers/auth-provider";
import { useTeam } from "@/providers/team-provider";
import { ExpenseSheet } from "@/components/sheets/expense-sheet";
import { useState } from "react";
import { DestructiveAlert } from "@/components/ui/alert-toast";

export default function ExpenseListClient() {
  const { authLoading, user } = useAuth();
  const { teamId, loadingTeams, currentTeamRole } = useTeam();
  const { data, isLoading, error } = useExpenses();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRowClick = (row: Expense) => {
    setIsEditMode(false);
    setSelectedExpense(row);
    setIsSheetOpen(true);
  };

  const handleView = (row: Expense) => {
    setIsEditMode(false);
    setSelectedExpense(row);
    setIsSheetOpen(true);
  };

  const handleEdit = (row: Expense) => {
    const canEdit =
      ["admin", "manager"].includes(currentTeamRole ?? "") ||
      row.createdBy === user?.id;

    if (canEdit && (row.status === "draft" || row.status === "rejected")) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
    setSelectedExpense(row);
    setIsSheetOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">Expense List</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your expenses.
        </p>
      </div>
      {(authLoading || loadingTeams || isLoading) && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}
      {error && (
        <DestructiveAlert
          title="Failed to load expenses"
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
        columns={columns}
        onRowClick={handleRowClick}
        meta={{
          onView: handleView,
          onEdit: handleEdit,
          currentUserId: user?.id,
          canManageAll: ["admin", "manager"].includes(currentTeamRole ?? ""),
        }}
      />
      <ExpenseSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expense={selectedExpense}
        defaultEditMode={isEditMode}
        canEdit={
          selectedExpense
            ? (["admin", "manager"].includes(currentTeamRole ?? "") ||
                selectedExpense.createdBy === user?.id) &&
              (selectedExpense.status === "draft" ||
                selectedExpense.status === "rejected")
            : false
        }
      />
    </div>
  );
}
