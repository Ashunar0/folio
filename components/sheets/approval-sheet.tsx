"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Expense, expenseSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApproveExpense, useRejectExpense } from "@/lib/api/approvals";
import { useState } from "react";
import { toast } from "sonner";

const statusMap: Record<string, string> = {
  draft: "下書き",
  submitted: "申請中",
  approved: "承認済",
  rejected: "差戻し",
};

// スキーマを拡張してコメントを追加
const approvalSchema = expenseSchema.extend({
  approvalComment: z.string().optional(),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

type ApprovalSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  defaultEditMode?: boolean; // 互換性のために残すが使用しない
  canApprove?: boolean;
};

export function ApprovalSheet({
  open,
  onOpenChange,
  expense,
  canApprove = true,
}: ApprovalSheetProps) {
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const [actionError, setActionError] = useState<string | null>(null);

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema) as any,
    defaultValues: {
      id: "",
      date: "",
      amount: 0,
      type: "expense",
      category: "",
      event: "",
      createdBy: "",
      status: "draft",
      memo: "",
      receiptUrl: null,
      approvalComment: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  useEffect(() => {
    if (expense) {
      let formattedDate = expense.date;
      try {
        const dateObj = new Date(expense.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split("T")[0];
        }
      } catch (e) {
        console.error("Invalid date format:", expense.date);
      }

      form.reset({
        ...expense,
        amount: Math.abs(expense.amount),
        date: formattedDate,
        event: expense.event ?? "",
        receiptUrl: expense.receiptUrl ?? null,
        approvalComment: "",
      });
    }
  }, [expense, form]);

  if (!expense) return null;

  const onApprove = async (data: ApprovalFormValues) => {
    if (!expense) return;
    if (!canApprove) {
      setActionError("承認権限がありません");
      return;
    }
    setActionError(null);
    try {
      await approveMutation.mutateAsync(expense.id);
      onOpenChange(false);
    } catch (err: any) {
      setActionError(err.message ?? "承認に失敗しました");
    }
  };

  const onReject = async (data: ApprovalFormValues) => {
    if (!expense) return;
    if (!canApprove) {
      setActionError("承認権限がありません");
      return;
    }
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        expenseId: expense.id,
        comment: data.approvalComment ?? undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      setActionError(err.message ?? "差戻しに失敗しました");
    }
  };

  const handleApprove = async () => {
    await onApprove(form.getValues());
  };
  const handleReject = async () => {
    await onReject(form.getValues());
  };

  // 表示用のヘルパー
  const renderField = (
    label: string,
    value: string | number | null | undefined
  ) => (
    <div className="grid gap-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value ?? "-"}</div>
    </div>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) form.reset();
        onOpenChange(open);
      }}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>承認詳細</SheetTitle>
          <SheetDescription>
            申請内容を確認し、承認または差戻しを行います。
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          {!canApprove && (
            <div className="text-sm text-muted-foreground border border-dashed rounded-md p-3 bg-muted/30">
              承認・差戻しは admin / manager のみ実行できます。
            </div>
          )}

          {/* 申請内容の表示 (読み取り専用) */}
          <div className="grid gap-4 border rounded-md p-4 bg-muted/10">
            <div className="grid grid-cols-2 gap-4">
              {renderField("Date", form.getValues("date"))}
              {renderField(
                "Amount",
                `¥${Number(form.getValues("amount")).toLocaleString()}`
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField(
                "Type",
                form.getValues("type") === "expense" ? "支出" : "収入"
              )}
              {renderField(
                "Status",
                statusMap[form.getValues("status")] || form.getValues("status")
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField("Category", form.getValues("category"))}
              {renderField("Event", form.getValues("event"))}
            </div>

            {renderField("Created By", form.getValues("createdBy"))}

            <div className="grid gap-1">
              <div className="text-xs font-medium text-muted-foreground">
                Memo
              </div>
              <div className="text-sm whitespace-pre-wrap bg-background border rounded p-2 min-h-[60px]">
                {form.getValues("memo")}
              </div>
            </div>

            <div className="grid gap-1">
              <div className="text-xs font-medium text-muted-foreground">
                Receipt
              </div>
              <div className="border border-dashed rounded-md p-4 flex items-center justify-center text-muted-foreground text-xs h-24 bg-background">
                Receipt Preview
              </div>
            </div>
          </div>

          <Separator />

          {/* 承認アクションフォーム */}
          <Form {...form}>
            <form className="grid gap-4">
              <FormField
                control={form.control}
                name="approvalComment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>承認/差戻しコメント</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="コメントを入力してください（差戻しの場合は必須推奨）"
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <SheetFooter className="flex flex-col gap-2 items-stretch">
          {actionError && (
            <div className="text-sm text-red-600">{actionError}</div>
          )}
          <Button
            onClick={handleApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={approveMutation.isPending || !canApprove}
          >
            {approveMutation.isPending ? "処理中..." : "承認"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={rejectMutation.isPending || !canApprove}
          >
            {rejectMutation.isPending ? "処理中..." : "差戻し"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">閉じる</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
