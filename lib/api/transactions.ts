import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { Transaction } from "@/lib/schemas";
import { assertTeamSelected } from "@/lib/permissions";

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    type: row.type,
    category: row.categories?.name ?? row.category_id ?? "",
    event: row.events?.name ?? row.event_id ?? null,
    createdBy: row.profiles?.name ?? row.created_by,
    createdById: row.created_by,
    memo: row.memo ?? undefined,
    receiptUrl: row.receipt_url ?? null,
  };
}

export function useTransactions() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["transactions", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      assertTeamSelected(teamId);
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          categories ( name ),
          events ( name ),
          profiles:profiles!transactions_created_by_fkey ( name )
        `
        )
        .eq("team_id", teamId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapTransaction);
    },
  });
}
