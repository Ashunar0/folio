"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, JapaneseYen, SendIcon, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { expenseFormSchema, ExpenseFormInput } from "@/lib/schemas";
import { uploadReceipt } from "@/lib/storage";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { useCreateExpense } from "@/lib/api/expenses";
import { useCategories } from "@/lib/api/categories";
import { toast } from "sonner";

export default function ExpenseFormClient() {
  const supabase = useSupabase();
  const { teamId } = useTeam();
  const createExpense = useCreateExpense();
  const categoriesQuery = useCategories();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    { id: string; name: string; type: "expense" | "income" }[]
  >([]);

  const form = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema) as Resolver<ExpenseFormInput>,
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      amount: 0,
      type: "expense",
      category: "",
      event: "",
      memo: "",
      receiptUrl: null,
    },
  });

  const watchType = form.watch("type");

  useEffect(() => {
    if (categoriesQuery.data) {
      const mapped = categoriesQuery.data.map((c) => ({
        id: c.id,
        name: c.name,
        type: (c.type as "expense" | "income" | undefined) ?? "expense",
      }));
      setCategoryOptions(mapped);
    }
  }, [categoriesQuery.data]);

  const filteredCategories = useMemo(() => {
    if (!categoryOptions.length) return [];
    if (watchType === "income") {
      return categoryOptions.filter((c) => c.type === "income");
    }
    return categoryOptions.filter((c) => c.type !== "income");
  }, [categoryOptions, watchType]);

  useEffect(() => {
    const current = form.getValues("category");
    if (!current) return;
    const exists = filteredCategories.some((c) => c.name === current);
    if (!exists) {
      form.setValue("category", "");
    }
  }, [filteredCategories, form]);

  const onSubmit = async (data: ExpenseFormInput) => {
    setSubmitError(null);
    try {
      if (!teamId) throw new Error("Select a team");
      await createExpense.mutateAsync(data);
      toast.success("Expense submitted successfully");
      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        amount: 0,
        type: "expense",
        category: "",
        event: "",
        memo: "",
        receiptUrl: null,
      });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to submit expense";
      setSubmitError(message);
      toast.error("Failed to submit expense", {
        description: message,
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">Expense Form</h1>
        <p className="text-muted-foreground mt-2">
          Enter the necessary information and apply for expenses.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                            <span>日付を選択</span>
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
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">支出</SelectItem>
                      <SelectItem value="income">収入</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <JapaneseYen className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                      <Input
                        type="number"
                        className="pl-7"
                        placeholder="0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={categoriesQuery.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoriesQuery.isLoading
                              ? "Loading..."
                              : "選択してください"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>
                          該当するカテゴリがありません
                        </SelectItem>
                      ) : (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="event"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event / Related Project (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="例: 定期演奏会、夏合宿"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memo / Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="用途の詳細などを入力してください"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiptUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt / Receipt</FormLabel>
                <FormControl>
                  <div
                    className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("receipt-upload")?.click()
                    }
                  >
                    <UploadCloud className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">
                      {isUploading ? "Uploading..." : "Click to upload image"}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      Or drag and drop
                    </span>
                    <input
                      id="receipt-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadError(null);
                        setIsUploading(true);
                        try {
                          const {
                            data: { user },
                          } = await supabase.auth.getUser();
                          if (!teamId) {
                            throw new Error("team_id が設定されていません");
                          }

                          if (!user?.id) {
                            throw new Error("ログインが必要です");
                          }

                          const path = await uploadReceipt({
                            supabase,
                            file,
                            teamId,
                            userId: user.id,
                          });
                          field.onChange(path);
                        } catch (err: unknown) {
                          console.error(err);
                          const message =
                            err instanceof Error
                              ? err.message
                              : typeof err === "string"
                              ? err
                              : "アップロードに失敗しました";
                          setUploadError(message);
                        } finally {
                          setIsUploading(false);
                          e.target.value = ""; // allow re-upload same file
                        }
                      }}
                    />
                  </div>
                </FormControl>
                {field.value && !uploadError && (
                  <p className="text-sm text-emerald-600 mt-2">
                    ✓ Image uploaded
                  </p>
                )}
                {uploadError && (
                  <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full md:w-auto md:min-w-[200px]"
              disabled={createExpense.isPending}
            >
              <SendIcon className="mr-2 h-4 w-4" />
              {createExpense.isPending ? "Submitting..." : "Apply"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
