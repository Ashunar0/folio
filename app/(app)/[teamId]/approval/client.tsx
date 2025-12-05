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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabase } from "@/providers/supabase-provider";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

export default function ApprovalClient() {
  const { authLoading } = useAuth();
  const { teamId, loadingTeams, currentTeamRole } = useTeam();
  const { data, isLoading, error } = useApprovalList();
  const canApprove = ["admin", "manager"].includes(currentTeamRole ?? "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const supabase = useSupabase();

  const handleRowClick = (row: Expense) => {
    setSelectedExpense(row);
    setIsSheetOpen(true);
  };

  const handleReview = (row: Expense) => {
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
        searchColumn="category"
        searchPlaceholder="Search by category..."
        meta={{
          onEdit: handleReview,
          onReceiptPreview: handleReceiptPreview,
        }}
      />
      <ApprovalSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expense={selectedExpense}
        canApprove={canApprove}
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span>読み込み中...</span>
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
