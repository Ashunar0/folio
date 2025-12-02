"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { Expense, expenseSchema, ExpenseFormValues } from "@/lib/schemas";
import { IconPencil } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateExpense } from "@/lib/api/expenses";

const statusMap: Record<string, string> = {
  draft: "下書き",
  submitted: "申請中",
  approved: "承認済",
  rejected: "差戻し",
};

type ExpenseSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  defaultEditMode?: boolean;
  canEdit?: boolean;
};

export function ExpenseSheet({
  open,
  onOpenChange,
  expense,
  defaultEditMode = false,
  canEdit = true,
}: ExpenseSheetProps) {
  const [isEditMode, setIsEditMode] = useState(defaultEditMode && canEdit);
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateExpense = useUpdateExpense(expense);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
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
      approvalComment: null,
    },
  });

  // openがtrueになったときにdefaultEditModeを反映
  useEffect(() => {
    if (open) {
      setIsEditMode(defaultEditMode && canEdit);
    }
  }, [open, defaultEditMode, canEdit]);

  // expenseが変わったらformの値を更新
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
        event: expense.event ?? "", // null -> ""
        receiptUrl: expense.receiptUrl ?? null,
        approvalComment: expense.approvalComment ?? null,
      });
    }
  }, [expense, form]);

  if (!expense) return null;

  const onSave = async (data: ExpenseFormValues) => {
    setSaveError(null);
    try {
      await updateExpense.mutateAsync(data as Expense);
      setIsEditMode(false);
    } catch (err: any) {
      setSaveError(err.message ?? "保存に失敗しました");
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditMode(false);
          form.reset(); // 閉じる時にリセット
        }
        onOpenChange(open);
      }}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>経費詳細</SheetTitle>
          <SheetDescription>
            申請内容の詳細を確認・編集します。
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4 text-sm">
          {form.watch("status") === "rejected" &&
            form.watch("approvalComment") && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md">
                <div className="font-bold text-xs mb-1">差戻し理由:</div>
                <div className="text-sm whitespace-pre-wrap">
                  {form.watch("approvalComment")}
                </div>
              </div>
            )}

          <div className="flex justify-end">
            {!isEditMode &&
              (expense.status === "draft" || expense.status === "rejected") && (
                <Button
                  onClick={() => canEdit && setIsEditMode(true)}
                  disabled={!canEdit}
                >
                  <IconPencil size={16} />
                  <span>Edit</span>
                </Button>
              )}
          </div>

          {saveError && (
            <div className="text-sm text-red-600">{saveError}</div>
          )}

          <Form {...form}>
            <form id="expense-form" className="grid gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    {isEditMode ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "yyyy/MM/dd")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="text-sm pt-1">{field.value}</div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    {isEditMode ? (
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">¥</span>
                          <Input type="number" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                    ) : (
                      <div className="text-sm pt-1">
                        ¥{Number(field.value).toLocaleString()}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      {isEditMode ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="種別を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="expense">支出</SelectItem>
                            <SelectItem value="income">収入</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm pt-1">
                          {field.value === "expense" ? "支出" : "収入"}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <div className="text-sm pt-1 font-medium">
                        {statusMap[field.value] || field.value}
                      </div>
                      <input type="hidden" {...form.register("status")} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    {isEditMode ? (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="交通費">交通費</SelectItem>
                          <SelectItem value="宿泊費">宿泊費</SelectItem>
                          <SelectItem value="接待交際費">接待交際費</SelectItem>
                          <SelectItem value="消耗品費">消耗品費</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm pt-1">{field.value}</div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event</FormLabel>
                    {isEditMode ? (
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                    ) : (
                      <div className="text-sm pt-1">
                        {field.value || "なし"}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created By</FormLabel>
                    {isEditMode ? (
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    ) : (
                      <div className="text-sm pt-1">{field.value}</div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memo</FormLabel>
                    {isEditMode ? (
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap pt-1">
                        {field.value}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid gap-2">
                <FormLabel>Receipt</FormLabel>
                <div className="border border-dashed rounded-md p-4 flex items-center justify-center text-muted-foreground text-xs h-24">
                  Receipt Preview
                </div>
              </div>
            </form>
          </Form>
        </div>
        <SheetFooter>
          {isEditMode ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  form.setValue("status", "draft");
                  form.handleSubmit(onSave)();
                }}
              >
                下書き保存
              </Button>
              <Button
                onClick={() => {
                  form.setValue("status", "submitted");
                  form.handleSubmit(onSave)();
                }}
              >
                申請する
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditMode(false);
                  form.reset(); // キャンセル時にリセット
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
