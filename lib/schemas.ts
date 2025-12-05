import { z } from "zod";

// --- Expense ---
export const expenseSchema = z.object({
  id: z.string(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "有効な日付を入力してください",
  }),
  amount: z.coerce.number().min(1, "金額を入力してください"),
  type: z.enum(["expense", "income"]),
  category: z.string().min(1, "カテゴリを選択してください"),
  event: z.string().nullable().optional(),
  createdBy: z.string().min(1, "作成者を入力してください"),
  createdById: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]),
  memo: z.string().optional(),
  receiptUrl: z.string().nullable().optional(),
  approvalComment: z.string().nullable().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;
// FormValues型エイリアス（互換性のため）
export type ExpenseFormValues = Expense;

// --- Expense Form (Input) ---
export const expenseFormSchema = expenseSchema.omit({
  id: true,
  createdBy: true,
  status: true,
  approvalComment: true,
});

export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;

// --- Transaction ---
export const transactionSchema = z.object({
  id: z.string(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "有効な日付を入力してください",
  }),
  amount: z.coerce.number().min(1, "金額を入力してください"),
  type: z.enum(["expense", "income"]),
  category: z.string().min(1, "カテゴリを選択してください"),
  event: z.string().nullable().optional(),
  createdBy: z.string().min(1, "作成者を入力してください"),
  createdById: z.string().optional(),
  memo: z.string().optional(),
  receiptUrl: z.string().nullable().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
// FormValues型エイリアス（互換性のため）
export type TransactionFormValues = Transaction;

// --- Category ---
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  teamId: z.string().nullable(),
  createdAt: z.string().optional(),
  type: z.enum(["expense", "income"]).optional(),
  sortOrder: z.number().optional(),
});

export type Category = z.infer<typeof categorySchema>;

// --- Event ---
export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string().nullable().optional(),
  teamId: z.string(),
  createdAt: z.string().optional(),
});

export type EventItem = z.infer<typeof eventSchema>;

// --- User ---
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.enum(["admin", "manager", "member", "viewer"]),
  status: z.enum(["active", "invited", "suspended"]),
  joinedAt: z.string(),
  lastLogin: z.string().nullable(),
});


export type User = z.infer<typeof userSchema>;

// --- Create Team ---
export const createTeamSchema = z.object({
  name: z.string().min(1, "チーム名を入力してください").max(50, "チーム名は50文字以内で入力してください"),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
