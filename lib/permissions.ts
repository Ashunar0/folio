import { Expense, Transaction } from "@/lib/schemas";

const APPROVABLE_ROLES = ["admin", "manager"] as const;
const MANAGE_ROLES = ["admin", "manager"] as const;

function ensureRole(role: string | null | undefined) {
  if (!role) throw new Error("権限情報の取得に失敗しました");
}

export function canApprove(role: string | null | undefined) {
  return APPROVABLE_ROLES.includes(role as (typeof APPROVABLE_ROLES)[number]);
}

export function assertCanApprove(role: string | null | undefined) {
  ensureRole(role);
  if (!canApprove(role)) {
    throw new Error("承認・差戻しは admin / manager のみ実行できます");
  }
}

export function canEditExpense(params: {
  expense: Pick<Expense, "status" | "createdById">;
  role: string | null | undefined;
  userId: string | null | undefined;
}) {
  const { expense, role, userId } = params;
  if (!role) return false;

  const isOwner = expense.createdById && userId === expense.createdById;
  const isEditableStatus = ["draft", "submitted"].includes(expense.status);

  if (role === "admin") return true;
  if (role === "manager") return isEditableStatus;
  if (role === "member") return isEditableStatus && !!isOwner;
  return false;
}

export function canDeleteExpense(params: {
  expense: Pick<Expense, "createdById">;
  role: string | null | undefined;
  userId: string | null | undefined;
}) {
  const { expense, role, userId } = params;
  if (!role) return false;

  if (role === "admin") return true;
  if (role === "manager") return expense.createdById === userId;
  return false;
}

export function canDeleteTransaction(params: {
  transaction: Pick<Transaction, "createdById">;
  role: string | null | undefined;
}) {
  const { transaction, role } = params;
  if (!role) return false;
  return (
    MANAGE_ROLES.includes(role as (typeof MANAGE_ROLES)[number]) &&
    !!transaction.createdById
  );
}

export function assertTeamSelected(teamId: string | null | undefined) {
  if (!teamId) {
    throw new Error("チームを選択してください");
  }
}

export function assertCanManageTeamUser(role: string | null | undefined) {
  ensureRole(role);
  if (!MANAGE_ROLES.includes(role as (typeof MANAGE_ROLES)[number])) {
    throw new Error("ロール変更は admin / manager のみ実行できます");
  }
}
