import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { useAuth } from "@/providers/auth-provider";
import { assertTeamSelected } from "@/lib/permissions";
import { Category } from "@/lib/schemas";

type CreateCategoryInput = {
  name: string;
  type: "expense" | "income";
};

type UpdateCategoryInput = {
  id: string;
  name: string;
  teamId: string | null;
  type?: "expense" | "income";
};

type DeleteCategoryInput = {
  id: string;
  teamId: string | null;
};

type ReorderCategoryInput = {
  id: string;
  team_id: string;
  sort_order: number;
  type: "expense" | "income";
  name: string;
};

function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    teamId: row.team_id,
    createdAt: row.created_at,
    type: row.type ?? "expense",
    sortOrder: row.sort_order ?? undefined,
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
      const fetchWithSort = async () => {
        return supabase
          .from("categories")
          .select("*")
          .or(`team_id.eq.${teamId},team_id.is.null`)
          .order("type", { ascending: true })
          .order("sort_order", { ascending: true, nullsFirst: true })
          .order("created_at", { ascending: true });
      };

      const fetchWithoutSort = async () => {
        return supabase
          .from("categories")
          .select("*")
          .or(`team_id.eq.${teamId},team_id.is.null`)
          .order("created_at", { ascending: true });
      };

      const attempt = async () => {
        const { data, error } = await fetchWithSort();
        if (error) {
          const msg = (error as any)?.message ?? "";
          const code = (error as any)?.code ?? "";
          if (
            code === "42703" ||
            msg.includes("sort_order") ||
            msg.includes("type")
          ) {
            return fetchWithoutSort();
          }
          throw error;
        }
        return { data, error: null };
      };

      const { data, error } = await attempt();
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
          type: input.type,
        })
        .select("*")
        .single();

      if (error) throw error;
      return mapCategory(data);
    },
    onSuccess: () => {
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
        .update({
          name,
          ...(input.type ? { type: input.type } : {}),
        })
        .eq("id", input.id)
        .eq("team_id", teamId)
        .select("*")
        .single();

      if (error) throw error;
      return mapCategory(data);
    },
    onSuccess: () => {
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

export function useReorderCategories() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: ReorderCategoryInput[]) => {
      assertTeamSelected(teamId);
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("並び替えは admin / manager のみ可能です");
      }
      if (!items.length) return;
      const updates = items.map((item) =>
        supabase
          .from("categories")
          .update({
            sort_order: item.sort_order ?? 0,
            type: (item.type as "expense" | "income") ?? "expense",
          })
          .eq("id", item.id)
          .eq("team_id", item.team_id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error)?.error;
      if (err) {
        const msg = (err as any)?.message ?? "";
        const code = (err as any)?.code ?? "";
        if (code === "42703" || msg.includes("sort_order")) {
          throw new Error(
            "並び順を保存するには categories テーブルに sort_order 列が必要です。最新のマイグレーションを適用してください。"
          );
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", teamId] });
    },
    onError: (error) => {
      console.error(
        "Failed to reorder categories:",
        (error as any)?.message ?? error
      );
    },
  });
}
