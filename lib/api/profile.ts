import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useAuth } from "@/providers/auth-provider";
import { useTeams } from "@/providers/team-provider";
import { toast } from "sonner";

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  username?: string | null;
  created_at: string;
};

/**
 * プロフィール取得
 */
export function useProfile() {
  const { user: authUser } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["profile", authUser?.id],
    enabled: Boolean(authUser?.id),
    queryFn: async () => {
      if (!authUser?.id) throw new Error("認証が必要です");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
  });
}

/**
 * プロフィール更新
 */
export function useUpdateProfile() {
  const { user: authUser } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { 
      name?: string; 
      username?: string | null; 
      avatar_url?: string | null;
    }) => {
      if (!authUser?.id) throw new Error("ログインが必要です");
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", authUser.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", authUser?.id] });
      toast.success("プロフィールを更新しました");
    },
    onError: () => {
      toast.error("プロフィールの更新に失敗しました");
    },
  });
}

/**
 * アバターアップロード
 */
export function useUploadAvatar() {
  const { user: authUser } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!authUser?.id) throw new Error("ログインが必要です");

      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${authUser.id}/${crypto.randomUUID()}.${extension}`;

      // 古いアバターがあれば削除
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/").slice(-2).join("/");
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      // 新しいアバターをアップロード
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", authUser.id);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", authUser?.id] });
      toast.success("プロフィール画像を更新しました");
    },
    onError: (error) => {
      console.error("Avatar upload error:", error);
      toast.error("画像のアップロードに失敗しました");
    },
  });
}

/**
 * アバター削除
 */
export function useRemoveAvatar() {
  const { user: authUser } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async () => {
      if (!authUser?.id) throw new Error("ログインが必要です");

      if (profile?.avatar_url) {
        const path = profile.avatar_url.split("/").slice(-2).join("/");
        await supabase.storage.from("avatars").remove([path]);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", authUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", authUser?.id] });
      toast.success("プロフィール画像を削除しました");
    },
    onError: () => {
      toast.error("画像の削除に失敗しました");
    },
  });
}

/**
 * 各チームのメンバー数を取得
 */
export function useTeamMemberCounts() {
  const { teams } = useTeams();
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["team-member-counts", teams.map((t) => t.id)],
    enabled: teams.length > 0,
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const team of teams) {
        const { count } = await supabase
          .from("team_users")
          .select("*", { count: "exact", head: true })
          .eq("team_id", team.id);
        counts[team.id] = count ?? 0;
      }
      return counts;
    },
  });
}
