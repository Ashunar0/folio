import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import { User } from "@/lib/schemas";
import { assertCanManageTeamUser, assertTeamSelected } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

type TeamUserRow = {
  user_id: string;
  role: "admin" | "manager" | "member" | "viewer";
  created_at: string;
  profiles?: { name?: string | null; email?: string | null } | null;
};

function mapUser(row: TeamUserRow): User {
  return {
    id: row.user_id,
    name: row.profiles?.name ?? "",
    email: row.profiles?.email ?? "",
    role: row.role,
    status: "active", // status 未実装のため仮で active
    joinedAt: row.created_at,
    lastLogin: null,
  };
}

export function useUsers() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["users", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      assertTeamSelected(teamId);
      const { data, error } = await supabase
        .from("team_users")
        .select("user_id, role, created_at, profiles(name, email)")
        .eq("team_id", teamId);

      if (error) throw error;
      return (data ?? []).map(mapUser);
    },
  });
}

export function useUpdateUserRole() {
  const supabase = useSupabase();
  const { teamId, currentTeamRole } = useTeam();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; role: string }) => {
      assertTeamSelected(teamId);
      assertCanManageTeamUser(currentTeamRole);
      if (!user?.id) throw new Error("ログインが必要です");

      const { error } = await supabase
        .from("team_users")
        .update({ role: params.role })
        .eq("team_id", teamId)
        .eq("user_id", params.userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", teamId] });
    },
  });
}
