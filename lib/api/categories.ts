import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { useAuth } from "@/providers/auth-provider";
import { assertTeamSelected } from "@/lib/permissions";
import { Category } from "@/lib/schemas";

type CreateCategoryInput = {
  name: string;
};

type UpdateCategoryInput = {
  id: string;
  name: string;
  teamId: string | null;
};

type DeleteCategoryInput = {
  id: string;
  teamId: string | null;
};

function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    teamId: row.team_id,
    createdAt: row.created_at,
  };
}

export function useCategories() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["categories", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      assertTeamSelected(teamId);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`team_id.eq.${teamId},team_id.is.null`)
        .order("team_id", { ascending: false, nullsLast: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapCategory);
    },
  });
}

export function useCreateCategory() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const name = input.name.trim();
      if (!name) throw new Error("カテゴリ名を入力してください");
      assertTeamSelected(teamId);
      if (!user?.id) throw new Error("ログインが必要です");
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("カテゴリの作成は admin / manager のみ可能です");
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name,
          team_id: teamId,
          created_by: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      return mapCategory(data);
    },
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["categories", teamId] });
    },
  });
}

export function useUpdateCategory() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const name = input.name.trim();
      if (!name) throw new Error("カテゴリ名を入力してください");
      assertTeamSelected(teamId);
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("カテゴリの更新は admin / manager のみ可能です");
      }
      if (!input.teamId || input.teamId !== teamId) {
        throw new Error("共有カテゴリは変更できません");
      }

      const { data, error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", input.id)
        .eq("team_id", teamId)
        .select("*")
        .single();

      if (error) throw error;
      return mapCategory(data);
    },
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["categories", teamId] });
    },
  });
}

export function useDeleteCategory() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteCategoryInput) => {
      assertTeamSelected(teamId);
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("カテゴリの削除は admin / manager のみ可能です");
      }
      if (!input.teamId || input.teamId !== teamId) {
        throw new Error("共有カテゴリは削除できません");
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", input.id)
        .eq("team_id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", teamId] });
    },
  });
}
