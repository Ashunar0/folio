"use client";

import dynamic from "next/dynamic";
import { columns } from "./columns";
import { Transaction } from "@/lib/schemas";
import type { DataTableProps } from "@/components/data-table";
import { useTransactions } from "@/lib/api/transactions";
import { useAuth } from "@/providers/auth-provider";
import { useTeam } from "@/providers/team-provider";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const TransactionDataTable = dynamic(
  async () => {
    const mod = await import("@/components/data-table");
    return function TransactionDataTable(
      props: DataTableProps<Transaction>
    ) {
      return <mod.DataTable<Transaction> {...props} />;
    };
  },
  {
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="h-4 w-4" />
        <span>テーブルを準備中...</span>
      </div>
    ),
  }
);

const TransactionSheet = dynamic(
  () =>
    import("@/components/sheets/transaction-sheet").then(
      (mod) => mod.TransactionSheet
    ),
  { loading: () => null }
);

export default function TransactionsClient() {
  const { authLoading, user } = useAuth();
  const { teamId, loadingTeams, currentTeamRole } = useTeam();
  const { data, isLoading, error } = useTransactions();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRowClick = (row: Transaction) => {
    setIsEditMode(false);
    setSelectedTransaction(row);
    setIsSheetOpen(true);
  };

  const handleView = (row: Transaction) => {
    setIsEditMode(false);
    setSelectedTransaction(row);
    setIsSheetOpen(true);
  };

  const handleEdit = (row: Transaction) => {
    const canEdit =
      ["admin", "manager"].includes(currentTeamRole ?? "") ||
      row.createdBy === user?.id;

    if (canEdit) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
    setSelectedTransaction(row);
    setIsSheetOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">Transaction List</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your transactions.
        </p>
      </div>
      {(authLoading || loadingTeams || isLoading) && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          Failed to load transactions: {error.message}
        </p>
      )}
      {!teamId && !loadingTeams && (
        <p className="text-sm text-muted-foreground">
          No team selected. Join or create a team.
        </p>
      )}
      <TransactionDataTable
        data={data ?? []}
        columns={columns}
        onRowClick={handleRowClick}
        searchColumn="category"
        searchPlaceholder="Search by category..."
        filters={[
          {
            column: "type",
            label: "Type",
            options: [
              { value: "expense", label: "支出" },
              { value: "income", label: "収入" },
            ],
          },
        ]}
        meta={{
          onView: handleView,
          onEdit: handleEdit,
          currentUserId: user?.id,
          canManageAll: ["admin", "manager"].includes(currentTeamRole ?? ""),
        }}
      />
      <TransactionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        transaction={selectedTransaction}
        defaultEditMode={isEditMode}
        canEdit={
          selectedTransaction
            ? ["admin", "manager"].includes(currentTeamRole ?? "") ||
              selectedTransaction.createdBy === user?.id
            : false
        }
      />
    </div>
  );
}
