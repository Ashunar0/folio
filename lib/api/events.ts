import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { useAuth } from "@/providers/auth-provider";
import { assertTeamSelected } from "@/lib/permissions";
import { EventItem } from "@/lib/schemas";

type CreateEventInput = {
  name: string;
  date?: string | null;
};

type UpdateEventInput = {
  id: string;
  name: string;
  date?: string | null;
  teamId: string;
};

type DeleteEventInput = {
  id: string;
  teamId: string;
};

function mapEvent(row: any): EventItem {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    teamId: row.team_id,
    createdAt: row.created_at,
  };
}

export function useEvents() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["events", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      assertTeamSelected(teamId);
      const currentTeamId = teamId!;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", currentTeamId)
        .order("date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapEvent);
    },
  });
}

export function useCreateEvent() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const name = input.name.trim();
      if (!name) throw new Error("イベント名を入力してください");
      assertTeamSelected(teamId);
      if (!user?.id) throw new Error("ログインが必要です");
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("イベントの作成は admin / manager のみ可能です");
      }

      const { data, error } = await supabase
        .from("events")
        .insert({
          name,
          date: input.date ?? null,
          team_id: teamId!,
          created_by: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      return mapEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
    },
  });
}

export function useUpdateEvent() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const name = input.name.trim();
      if (!name) throw new Error("イベント名を入力してください");
      assertTeamSelected(teamId);
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("イベントの更新は admin / manager のみ可能です");
      }
      if (input.teamId !== teamId) {
        throw new Error("他チームのイベントは変更できません");
      }

      const { data, error } = await supabase
        .from("events")
        .update({ name, date: input.date ?? null })
        .eq("id", input.id)
        .eq("team_id", teamId)
        .select("*")
        .single();

      if (error) throw error;
      return mapEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
    },
  });
}

export function useDeleteEvent() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteEventInput) => {
      assertTeamSelected(teamId);
      if (!["admin", "manager"].includes(currentTeamRole ?? "")) {
        throw new Error("イベントの削除は admin / manager のみ可能です");
      }
      if (input.teamId !== teamId) {
        throw new Error("他チームのイベントは削除できません");
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", input.id)
        .eq("team_id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
    },
  });
}
