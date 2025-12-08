import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { toast } from "sonner";

type TeamSettingsRow = {
  id: string;
  name: string;
  icon: string | null;
  profiles?: { name?: string | null; email?: string | null } | null;
};

export type TeamSettings = {
  id: string;
  name: string;
  icon: string | null;
  owner: {
    name: string;
    email: string;
  };
};

function mapTeamSettings(row: TeamSettingsRow): TeamSettings {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    owner: row.profiles
      ? {
          name: row.profiles.name ?? "Unknown",
          email: row.profiles.email ?? "",
        }
      : { name: "Unknown", email: "" },
  };
}

export function useTeamSettings(teamId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["team-settings", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          icon,
          profiles:created_by (
            name,
            email
          )
        `)
        .eq("id", teamId)
        .single();

      if (error) throw error;
      return mapTeamSettings(data as TeamSettingsRow);
    },
  });
}

/**
 * チーム設定更新（名前など）
 */
export function useUpdateTeamSettings(teamId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { name?: string; icon?: string | null }) => {
      const { error } = await supabase
        .from("teams")
        .update(updates)
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-settings", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("チーム設定を更新しました");
    },
    onError: () => {
      toast.error("チーム設定の更新に失敗しました");
    },
  });
}

/**
 * チームアイコンアップロード
 */
export function useUploadTeamIcon(teamId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: team } = useTeamSettings(teamId);

  return useMutation({
    mutationFn: async (file: File) => {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${teamId}/${crypto.randomUUID()}.${extension}`;

      // 古いアイコンがあれば削除
      if (team?.icon) {
        try {
          const oldPath = team.icon.split("/").slice(-2).join("/");
          await supabase.storage.from("team-icons").remove([oldPath]);
        } catch {
          // 古いアイコンの削除に失敗しても続行
        }
      }

      // 新しいアイコンをアップロード
      const { error: uploadError } = await supabase.storage
        .from("team-icons")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from("team-icons")
        .getPublicUrl(path);

      // チームテーブルを更新
      const { error: updateError } = await supabase
        .from("teams")
        .update({ icon: urlData.publicUrl })
        .eq("id", teamId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-settings", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("チームアイコンを更新しました");
    },
    onError: (error) => {
      console.error("Team icon upload error:", error);
      toast.error("アイコンのアップロードに失敗しました");
    },
  });
}

/**
 * チームアイコン削除
 */
export function useRemoveTeamIcon(teamId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: team } = useTeamSettings(teamId);

  return useMutation({
    mutationFn: async () => {
      if (team?.icon) {
        try {
          const path = team.icon.split("/").slice(-2).join("/");
          await supabase.storage.from("team-icons").remove([path]);
        } catch {
          // ストレージからの削除に失敗しても続行
        }
      }

      const { error } = await supabase
        .from("teams")
        .update({ icon: null })
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-settings", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("チームアイコンを削除しました");
    },
    onError: () => {
      toast.error("アイコンの削除に失敗しました");
    },
  });
}
