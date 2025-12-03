import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { Expense, ExpenseFormInput } from "@/lib/schemas";
import { assertTeamSelected, canEditExpense } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

type ExpenseRow = {
  id: string;
  date: string;
  amount: number;
  type: "expense" | "income";
  category_id?: string | null;
  event_id?: string | null;
  created_by: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  memo?: string | null;
  receipt_url?: string | null;
  approval_comment?: string | null;
  categories?: { name?: string | null } | null;
  events?: { name?: string | null } | null;
  profiles?: { name?: string | null } | null;
};

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    type: row.type,
    category: row.categories?.name ?? row.category_id ?? "",
    event: row.events?.name ?? row.event_id ?? null,
    createdBy: row.profiles?.name ?? row.created_by,
    createdById: row.created_by,
    status: row.status,
    memo: row.memo ?? undefined,
    receiptUrl: row.receipt_url ?? null,
    approvalComment: row.approval_comment ?? null,
  };
}

export function useExpenses() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["expenses", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      assertTeamSelected(teamId);
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          categories ( name ),
          events ( name ),
          profiles:profiles!expenses_created_by_fkey ( name )
        `
        )
        .eq("team_id", teamId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapExpense);
    },
  });
}

async function resolveCategoryId(
  supabase: ReturnType<typeof useSupabase>,
  teamId: string,
  categoryName: string | null | undefined
) {
  if (!categoryName) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .or(`team_id.eq.${teamId},team_id.is.null`)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function resolveEventId(
  supabase: ReturnType<typeof useSupabase>,
  teamId: string,
  eventName: string | null | undefined
) {
  if (!eventName) return null;
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("name", eventName)
    .eq("team_id", teamId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export function useCreateExpense() {
  const supabase = useSupabase();
  const { teamId } = useTeam();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ExpenseFormInput) => {
      assertTeamSelected(teamId);
      if (!user?.id) throw new Error("ログインが必要です");

      const categoryId = await resolveCategoryId(
        supabase,
        teamId!,
        input.category
      );
      const eventId = await resolveEventId(supabase, teamId!, input.event ?? null);

      const { error } = await supabase.from("expenses").insert({
        team_id: teamId,
        date: input.date,
        amount: input.amount,
        type: input.type,
        category_id: categoryId,
        event_id: eventId,
        created_by: user.id,
        status: "submitted",
        memo: input.memo ?? null,
        receipt_url: input.receiptUrl ?? null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", teamId] });
      queryClient.invalidateQueries({ queryKey: ["approvals", teamId] });
    },
  });
}

export function useUpdateExpense(expense?: Expense | null) {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Expense) => {
      assertTeamSelected(teamId);
      if (!user?.id) throw new Error("ログインが必要です");
      if (!expense) throw new Error("対象の経費が選択されていません");

      const allowed = canEditExpense({
        expense: { status: expense.status, createdById: expense.createdById },
        role: currentTeamRole,
        userId: user.id,
      });
      if (!allowed) throw new Error("編集権限がありません");

      const categoryId = await resolveCategoryId(
        supabase,
        teamId!,
        input.category
      );
      const eventId = await resolveEventId(
        supabase,
        teamId!,
        input.event ?? null
      );

      const { error } = await supabase
        .from("expenses")
        .update({
          date: input.date,
          amount: input.amount,
          type: input.type,
          category_id: categoryId,
          event_id: eventId,
          memo: input.memo ?? null,
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", expense.id)
        .eq("team_id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", teamId] });
      queryClient.invalidateQueries({ queryKey: ["approvals", teamId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", teamId] });
    },
  });
}
