"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";

import { columns } from "./columns";
import { Expense } from "@/lib/schemas";
import { useExpenses } from "@/lib/api/expenses";
import { useAuth } from "@/providers/auth-provider";
import { useTeam } from "@/providers/team-provider";
import { DestructiveAlert } from "@/components/ui/alert-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabase } from "@/providers/supabase-provider";
import { Spinner } from "@/components/ui/spinner";

const DataTable = dynamic(
  () => import("@/components/data-table").then((mod) => mod.DataTable),
  {
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="h-4 w-4" />
        <span>テーブルを準備中...</span>
      </div>
    ),
  }
);

const ExpenseSheet = dynamic(
  () =>
    import("@/components/sheets/expense-sheet").then(
      (mod) => mod.ExpenseSheet
    ),
  { loading: () => null }
);

export default function ExpenseListClient() {
  const { authLoading, user } = useAuth();
  const { teamId, loadingTeams, currentTeamRole } = useTeam();
  const { data, isLoading, error } = useExpenses();
  const supabase = useSupabase();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);

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

  const handleReceiptPreview = async (path: string) => {
    setIsReceiptOpen(true);
    setReceiptPath(path);
    setReceiptUrl(null);
    setReceiptError(null);
    setIsReceiptLoading(true);

    const { data, error: signedError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 10);

    if (signedError) {
      setReceiptError(signedError.message);
      setReceiptUrl(null);
    } else {
      setReceiptUrl(data?.signedUrl ?? null);
    }
    setIsReceiptLoading(false);
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
        searchColumn="category"
        searchPlaceholder="Search by category..."
        filters={[
          {
            column: "status",
            label: "Status",
            options: [
              { value: "draft", label: "下書き" },
              { value: "submitted", label: "申請中" },
              { value: "approved", label: "承認済" },
              { value: "rejected", label: "差戻し" },
            ],
          },
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
          onReceiptPreview: handleReceiptPreview,
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
      <Dialog
        open={isReceiptOpen}
        onOpenChange={(open) => {
          setIsReceiptOpen(open);
          if (!open) {
            setReceiptPath(null);
            setReceiptUrl(null);
            setReceiptError(null);
            setIsReceiptLoading(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>領収書</DialogTitle>
          </DialogHeader>
          {isReceiptLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Spinner />
              <span>Loading...</span>
            </div>
          )}
          {receiptError && (
            <p className="text-sm text-destructive">{receiptError}</p>
          )}
          {!isReceiptLoading && !receiptError && receiptUrl && (
            <div className="flex justify-center">
              <Image
                src={receiptUrl}
                alt="Receipt preview"
                className="h-auto max-h-[75vh] w-auto max-w-full rounded-md border object-contain"
              />
            </div>
          )}
          {!isReceiptLoading && !receiptError && !receiptUrl && receiptPath && (
            <p className="text-sm text-muted-foreground">
              プレビューを取得できませんでした。
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
