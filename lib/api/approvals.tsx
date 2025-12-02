import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { Expense } from "@/lib/schemas";
import { assertCanApprove, assertTeamSelected } from "@/lib/permissions";
import { toast } from "sonner";
import { AlertSuccess, DestructiveAlert } from "@/components/ui/alert-toast";

function mapExpense(row: any): Expense {
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

export function useApprovalList() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["approvals", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      if (!teamId) return [] as Expense[];
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
        .eq("status", "submitted")
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapExpense);
    },
  });
}

export function useApproveExpense() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      assertTeamSelected(teamId);
      assertCanApprove(currentTeamRole);
      const { data, error } = await supabase.rpc("approve_expense", {
        p_expense_id: expenseId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", teamId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", teamId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", teamId] });
      toast.custom(() => <AlertSuccess title="Expense Approved" />);
    },
    onError: (error) => {
      toast.custom(() => (
        <DestructiveAlert
          title="Failed to Approve Expense"
          description={error.message ?? "Please try again"}
        />
      ));
    },
  });
}

export function useRejectExpense() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { expenseId: string; comment?: string }) => {
      assertTeamSelected(teamId);
      assertCanApprove(currentTeamRole);
      const { data, error } = await supabase.rpc("reject_expense", {
        p_expense_id: params.expenseId,
        p_comment: params.comment ?? undefined,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", teamId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", teamId] });
      toast.custom(() => <AlertSuccess title="Expense Rejected" />);
    },
    onError: (error) => {
      toast.custom(() => (
        <DestructiveAlert
          title="Failed to Reject Expense"
          description={error.message ?? "Please try again"}
        />
      ));
    },
  });
}
