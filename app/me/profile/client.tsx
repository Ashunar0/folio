"use client";

import { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Trash,
  UserRound,
  UsersRound,
  Loader2,
} from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { useTeams } from "@/providers/team-provider";
import { toast } from "sonner";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
  useTeamMemberCounts,
} from "@/lib/api/profile";

export default function ProfileClient() {
  const { authLoading } = useAuth();
  const { teams } = useTeams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // プロフィール取得
  const { data: profile, isLoading: profileLoading } = useProfile();

  // チームメンバー数取得
  const { data: teamMemberCounts } = useTeamMemberCounts();

  // プロフィール更新
  const updateProfileMutation = useUpdateProfile();

  // アバターアップロード
  const uploadAvatarMutation = useUploadAvatar();

  // アバター削除
  const removeAvatarMutation = useRemoveAvatar();

  // 名前の編集値
  const [nameValue, setNameValue] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  
  // 画像圧縮中の状態
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setNameValue(profile.name);
    }
    if (profile?.username !== undefined) {
      setUsernameValue(profile.username ?? "");
    }
  }, [profile?.name, profile?.username]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像ファイルかチェック
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsCompressing(true);
      toast.info("画像を最適化しています...");

      // 圧縮オプション
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
      };

      // 画像を圧縮
      const compressedFile = await imageCompression(file, options);

      // 圧縮後も5MBを超える場合はエラー
      if (compressedFile.size > 5 * 1024 * 1024) {
        toast.error("画像サイズが大きすぎます。別の画像を選択してください。");
        return;
      }

      // アップロード
      uploadAvatarMutation.mutate(compressedFile);
    } catch (error) {
      console.error("画像圧縮エラー:", error);
      toast.error("画像の処理中にエラーが発生しました");
    } finally {
      setIsCompressing(false);
      // inputをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Show skeleton while loading
  if (authLoading || profileLoading || !profile) {
    return (
      <div className="w-full max-w-3xl space-y-10">
        {/* Section 1: Profile Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-[18px] w-[18px] rounded" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Card className="py-0 rounded-md">
            <CardContent className="p-0">
              {/* Profile Picture */}
              <div className="flex items-center justify-between py-4 px-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <Separator />
              
              {/* Email */}
              <div className="flex items-center justify-between py-4 px-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <Separator />
              
              {/* Full Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-9 w-full sm:w-1/3" />
              </div>
              <Separator />
              
              {/* Username */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-9 w-full sm:w-1/3" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Teams Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-[18px] w-[18px] rounded" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Card className="py-0 rounded-md">
            <CardContent className="p-0">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  {i < 2 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  // アバターのイニシャルを取得
  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAvatarLoading = uploadAvatarMutation.isPending || removeAvatarMutation.isPending || isCompressing;

  return (
    <div className="w-full max-w-3xl space-y-10">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Section 1: 基本情報 */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <UserRound size={18} />
          Profile
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Profile Picture */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Profile picture</div>
                <div className="text-xs text-muted-foreground">
                  Your profile picture
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" disabled={isAvatarLoading}>
                  <div className="relative">
                    <Avatar className="h-10 w-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.name ?? ""} />
                      <AvatarFallback className="rounded-lg">
                        {profile?.name ? getInitials(profile.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    {isAvatarLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload new picture</span>
                  </DropdownMenuItem>
                  {profile?.avatar_url && (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => removeAvatarMutation.mutate()}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Remove picture</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator />

            {/* Email */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Email</div>
                <div className="text-xs text-muted-foreground">
                  Your email address
                </div>
              </div>
              <div className="text-muted-foreground text-sm">
                {profile?.email ?? "-"}
              </div>
            </div>
            <Separator />

            {/* Full Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Full name</div>
                <div className="text-xs text-muted-foreground">
                  Your full name
                </div>
              </div>
              <div className="w-full sm:w-1/3">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={() => {
                    if (nameValue.trim() && nameValue !== profile?.name) {
                      updateProfileMutation.mutate({ name: nameValue.trim() });
                    }
                  }}
                  className="h-9 text-sm"
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <Separator />

            {/* Username */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Username</div>
                <div className="text-xs text-muted-foreground">
                  Nickname or first name
                </div>
              </div>
              <div className="w-full sm:w-1/3">
                <Input
                  value={usernameValue}
                  onChange={(e) => setUsernameValue(e.target.value)}
                  onBlur={() => {
                    const newUsername = usernameValue.trim() || undefined;
                    const currentUsername = profile?.username ?? undefined;
                    if (newUsername !== currentUsername) {
                      updateProfileMutation.mutate({ username: newUsername ?? null });
                    }
                  }}
                  className="h-9 text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Your Teams */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <UsersRound size={18} />
          Your Teams
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {teams.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                チームに所属していません
              </div>
            ) : (
              teams.map((team, index) => (
                <div key={team.id}>
                  <div className="flex items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${encodeURIComponent(team.name)}`}
                          alt={team.name}
                        />
                        <AvatarFallback className="rounded-lg">
                          {team.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{team.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {teamMemberCounts?.[team.id] ?? "..."} members
                        </div>
                      </div>
                    </div>
                    <RoleBadge role={team.role} />
                  </div>
                  {index !== teams.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
