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

import {
  Transaction,
  transactionSchema,
  TransactionFormValues,
} from "@/lib/schemas";
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
import { JapaneseYen } from "lucide-react";

type TransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  defaultEditMode?: boolean;
  canEdit?: boolean;
};

export function TransactionSheet({
  open,
  onOpenChange,
  transaction,
  defaultEditMode = false,
  canEdit = true,
}: TransactionSheetProps) {
  const [isEditMode, setIsEditMode] = useState(defaultEditMode && canEdit);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      id: "",
      date: "",
      amount: 0,
      type: "expense",
      category: "",
      event: "",
      createdBy: "",
      memo: "",
      receiptUrl: null,
    },
  });

  useEffect(() => {
    if (open) {
      setIsEditMode(defaultEditMode && canEdit);
    }
  }, [open, defaultEditMode, canEdit]);

  useEffect(() => {
    if (transaction) {
      let formattedDate = transaction.date;
      try {
        const dateObj = new Date(transaction.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split("T")[0];
        }
      } catch (e) {
        console.error("Invalid date format:", transaction.date);
      }

      form.reset({
        ...transaction,
        amount: Math.abs(transaction.amount),
        date: formattedDate,
        event: transaction.event ?? "",
        receiptUrl: transaction.receiptUrl ?? null,
      });
    }
  }, [transaction, form]);

  if (!transaction) return null;

  const onSubmit = (data: TransactionFormValues) => {
    console.log("Saving data:", data);
    setIsEditMode(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditMode(false);
          form.reset();
        }
        onOpenChange(open);
      }}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>取引詳細</SheetTitle>
          <SheetDescription>
            取引内容の詳細を確認・編集します。
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4 text-sm">
          <div className="flex justify-end">
            {!isEditMode && (
              <Button
                onClick={() => canEdit && setIsEditMode(true)}
                disabled={!canEdit}
              >
                <IconPencil size={16} />
                <span>Edit</span>
              </Button>
            )}
          </div>

          <Form {...form}>
            <form
              id="transaction-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
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
                          <JapaneseYen className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
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

              <div className="grid gap-2">
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
              <Button type="submit" form="transaction-form">
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
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
