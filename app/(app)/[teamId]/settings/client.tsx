"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { createInvite, revokeInvite } from "@/lib/actions/invites";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { cropToSquare } from "@/lib/utils/image";
import {
  AlertTriangle,
  Copy,
  Database,
  Download,
  Link as LinkIcon,
  Loader2,
  Settings,
  Shield,
  Trash,
  Upload,
  Users,
  UserPlus,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { RoleBadge } from "@/components/role-badge";
import { User } from "@/lib/schemas";
import { Switch } from "@/components/ui/switch";
import {
  useTeamSettings,
  useUpdateTeamSettings,
  useUploadTeamIcon,
  useRemoveTeamIcon,
} from "@/lib/api/team-settings";
import { useTeam } from "@/providers/team-provider";

type InviteRow = {
  id: string;
  token: string;
  link: string;
  defaultRole: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdBy: string;
  createdAt: string;
};

interface SettingsClientProps {
  teamId: string;
  initialInvitations: InviteRow[];
}

export default function TeamSettingsClient({
  teamId,
  initialInvitations = [],
}: SettingsClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch team info with owner profile
  const { data: team } = useTeamSettings(teamId);
  const { currentTeamRole } = useTeam();

  // Mutations
  const updateTeamMutation = useUpdateTeamSettings(teamId);
  const uploadIconMutation = useUploadTeamIcon(teamId);
  const removeIconMutation = useRemoveTeamIcon(teamId);

  const [invitations, setInvitations] = useState(initialInvitations);
  
  // チーム名の編集値
  const [nameValue, setNameValue] = useState("");
  
  // 画像圧縮中の状態
  const [isCompressing, setIsCompressing] = useState(false);
  
  useEffect(() => {
    if (team?.name) {
      setNameValue(team.name);
    }
  }, [team?.name]);
  
  // ファイル変更ハンドラ
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
      // 画像を正方形にクロップ
      toast.info("画像を最適化しています...");
      const croppedFile = await cropToSquare(file, 512);

      // 圧縮オプション
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
      };

      // 画像を圧縮
      const compressedFile = await imageCompression(croppedFile, options);

      // 圧縮後も5MBを超える場合はエラー
      if (compressedFile.size > 5 * 1024 * 1024) {
        toast.error("画像サイズが大きすぎます。別の画像を選択してください。");
        return;
      }

      // アップロード
      uploadIconMutation.mutate(compressedFile);
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
  
  // アイコンのローディング状態
  const isIconLoading = uploadIconMutation.isPending || removeIconMutation.isPending || isCompressing;
  
  // アバターのイニシャルを取得
  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Permissions
  const canEdit = ["admin", "manager"].includes(currentTeamRole ?? "");
  const canInvite = ["admin", "manager"].includes(currentTeamRole ?? "");
  const canRevokeInvite = currentTeamRole === "admin";

  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  // Form states for invite dialog
  const [inviteRole, setInviteRole] = useState<"member" | "viewer">("member");
  const [inviteExpiry, setInviteExpiry] = useState("7");
  const [inviteMaxUses, setInviteMaxUses] = useState("10");

  // Form state for role change
  const [newRole, setNewRole] = useState<User["role"]>("member");

  // Copy state
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Handlers
  const handleGenerateInvite = async () => {
    setIsInviteDialogOpen(false);
    
    const expiresInDays = inviteExpiry === "never" ? null : parseInt(inviteExpiry);
    
    const result = await createInvite(teamId, inviteRole, expiresInDays);
    
    if (result.success && result.invite) {
      const newInvite = {
        id: result.invite.token,
        token: result.invite.token,
        link: `${window.location.origin}/invite/${result.invite.token}`,
        defaultRole: result.invite.role,
        expiresAt: result.invite.expires_at ? new Date(result.invite.expires_at).toLocaleDateString() : "Never",
        maxUses: 9999, // Unlimited
        usedCount: 0,
        createdBy: "You", // Ideally fetch user name or handle in UI
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setInvitations([newInvite, ...invitations]);
      toast.success("Invitation link generated", {
        description: "The link has been copied to your clipboard.",
      });
      navigator.clipboard.writeText(newInvite.link);
    } else {
      toast.error("Failed to generate invite", {
        description: result.error,
      });
    }
  };

  const handleCopyInvite = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedInviteId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleRevokeInvite = async (id: string) => {
    const result = await revokeInvite(teamId, id);
    
    if (result.success) {
      setInvitations(invitations.filter((i) => i.id !== id));
      toast.success("Invitation revoked");
    } else {
      toast.error("Failed to revoke invite", {
        description: result.error,
      });
    }
  };

  // const handleOpenRoleChange = (member: User) => {
  //   setSelectedMember(member);
  //   setNewRole(member.role);
  //   setIsRoleChangeDialogOpen(true);
  // };

  const handleChangeRole = () => {
    if (!selectedMember) return;
    console.log("👤 Changing user role:", {
      userId: selectedMember.id,
      userName: selectedMember.name,
      oldRole: selectedMember.role,
      newRole: newRole,
      changedBy: currentTeamRole,
      timestamp: new Date().toISOString(),
    });
    setIsRoleChangeDialogOpen(false);
    setSelectedMember(null);
  };

  // const handleRemoveMember = () => {
  //   if (!selectedMember) return;
  //   console.log("❌ Removing member from team:", {
  //     userId: selectedMember.id,
  //     userName: selectedMember.name,
  //     userEmail: selectedMember.email,
  //     removedBy: userRole,
  //     timestamp: new Date().toISOString(),
  //   });
  //   setIsRemoveMemberDialogOpen(false);
  //   setSelectedMember(null);
  // };

  return (
    <div className="w-full max-w-3xl space-y-10 py-8 mx-auto">
      <h1 className="text-xl font-bold tracking-tight">Team Settings</h1>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!team ? (
        <div className="text-center py-8">Loading team information...</div>
      ) : (
        <>
      {/* General */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Settings size={18} />
          General
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Team Icon */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Team Icon</div>
                <div className="text-xs text-muted-foreground">
                  Manage your team avatar
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" disabled={!canEdit || isIconLoading}>
                  <div className="relative">
                    <Avatar className="h-10 w-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={team.icon ?? undefined} alt={team.name} />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(team.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isIconLoading && (
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
                  {team.icon && (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => removeIconMutation.mutate()}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Remove picture</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator />

            {/* Team Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Team Name</div>
                <div className="text-xs text-muted-foreground">
                  The name of your team
                </div>
              </div>
              <div className="w-full sm:w-1/3">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={() => {
                    if (nameValue.trim() && nameValue !== team.name) {
                      updateTeamMutation.mutate({ name: nameValue.trim() });
                    }
                  }}
                  disabled={!canEdit}
                  className="h-9 text-sm"
                  placeholder="Enter team name"
                />
              </div>
            </div>
            <Separator />

            {/* Team ID */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Team ID</div>
                <div className="text-xs text-muted-foreground">
                  Unique identifier for your team
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {team.id}
                </code>
              </div>
            </div>
            <Separator />

            {/* Owner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Owner</div>
                <div className="text-xs text-muted-foreground">
                  Team owner
                </div>
              </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{team.owner.name}</div>
                  <div className="text-xs text-muted-foreground">{team.owner.email}</div>
                </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Permissions */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Shield size={18} />
          Permissions
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Approval Authority */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Approval Authority</div>
                <div className="text-xs text-muted-foreground">
                  Who can approve expenses
                </div>
              </div>
              <Select defaultValue="admin_manager">
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Only</SelectItem>
                  <SelectItem value="admin_manager">Admin & Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* Edit Others’ Expenses */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Edit Others’ Expenses</div>
                <div className="text-xs text-muted-foreground">
                  Who can edit expenses created by others
                </div>
              </div>
              <Select defaultValue="admin">
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Only</SelectItem>
                  <SelectItem value="admin_manager">Admin & Manager</SelectItem>
                  <SelectItem value="none">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* Transaction Editing */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Edit Transactions</div>
                <div className="text-xs text-muted-foreground">
                  Allow editing of transaction history
                </div>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 5: Members Management */}
      <section id="members" className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Users size={18} />
          Members Management
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-6 space-y-6">
            {/* Invite Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Invite Members</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate invitation links for new team members
                  </p>
                </div>
                {canInvite && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setIsInviteDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-3 w-3" />
                    Generate Link
                  </Button>
                )}
              </div>

              {/* Active Invitations List */}
              {invitations.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {invitations.map((invite) => (
                    <div key={invite.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate block">
                              {invite.link}
                            </code>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Role:{" "}
                              <span className="font-medium text-foreground">
                                {invite.defaultRole}
                              </span>
                            </span>
                            <span>
                              Expires:{" "}
                              <span className="font-medium text-foreground">
                                {invite.expiresAt}
                              </span>
                            </span>
                            <span>
                              Used:{" "}
                              <span className="font-medium text-foreground">
                                {invite.usedCount}/{invite.maxUses}
                              </span>
                            </span>
                            <span>
                              Created by:{" "}
                              <span className="font-medium text-foreground">
                                {invite.createdBy}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Copy link"
                            onClick={() => handleCopyInvite(invite.link, invite.id)}
                          >
                            {copiedInviteId === invite.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          {canRevokeInvite && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                              title="Revoke invitation"
                              onClick={() => handleRevokeInvite(invite.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md text-center border border-dashed">
                  No active invitations. Generate a link to invite new members.
                </div>
              )}
            </div>

            <Separator />

            {/* Role Management (Admin only) */}
            {/* {userRole === "admin" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Role Management</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Change member roles and permissions
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => (window.location.href = "/management/users")}
                  >
                    View All Members
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>

                <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                  {userTestData.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <RoleBadge role={member.role} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleOpenRoleChange(member)}
                        >
                          <Pen className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleOpenRemoveMember(member)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {currentTeamRole === "admin" && <Separator />}
          </CardContent>
        </Card>
      </section>

      {/* Section 6: Data & Integrations */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Database size={18} />
          Data & Integrations
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Data Export */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Data Export</div>
                <div className="text-xs text-muted-foreground">
                  Export team data
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="mr-2 h-3 w-3" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="mr-2 h-3 w-3" />
                  XLSX
                </Button>
              </div>
            </div>
            <Separator />

            {/* Storage Usage */}
            <div className="flex flex-col py-4 px-6 gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm">Storage Usage</div>
                  <div className="text-xs text-muted-foreground">
                    Receipts and attachments
                  </div>
                </div>
                <span className="text-sm font-medium">450MB / 5GB</span>
              </div>
              <Progress value={9} className="h-2" />
            </div>
            <Separator />

            {/* Notification */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive system alerts via email
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 7: Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          Danger Zone
        </h2>
        <Card className="py-0 rounded-md border-red-200">
          <CardContent className="p-0">
            {/* Archive Team */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Archive Team</div>
                <div className="text-xs text-muted-foreground">
                  Make this team read-only
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Archive
              </Button>
            </div>
            <Separator className="bg-red-100" />

            {/* Transfer Ownership */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Transfer Ownership</div>
                <div className="text-xs text-muted-foreground">
                  Transfer this team to another user
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Transfer
              </Button>
            </div>
            <Separator className="bg-red-100" />

            {/* Delete Team */}
            <div className="flex items-center justify-between py-4 px-6 bg-red-50/50 rounded-b-md">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-red-700">
                  Delete Team
                </div>
                <div className="text-xs text-red-600/80">
                  Permanently remove this team and all of its data
                </div>
              </div>
              <Button variant="destructive" size="sm" className="h-8">
                Delete Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Invitation Generation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Invitation Link</DialogTitle>
            <DialogDescription>
              Create a new invitation link to add members to your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Default Role */}
            <div className="space-y-2">
              <Label htmlFor="invite-role">Default Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value: "member" | "viewer") =>
                  setInviteRole(value)
                }
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                New members will be assigned this role by default
              </p>
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label htmlFor="invite-expiry">Expires In</Label>
              <Select value={inviteExpiry} onValueChange={setInviteExpiry}>
                <SelectTrigger id="invite-expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label htmlFor="invite-max-uses">Maximum Uses</Label>
              <Select value={inviteMaxUses} onValueChange={setInviteMaxUses}>
                <SelectTrigger id="invite-max-uses">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 use</SelectItem>
                  <SelectItem value="5">5 uses</SelectItem>
                  <SelectItem value="10">10 uses</SelectItem>
                  <SelectItem value="25">25 uses</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateInvite}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog
        open={isRoleChangeDialogOpen}
        onOpenChange={setIsRoleChangeDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role and permissions for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Info */}
            <div className="rounded-md bg-muted p-3 space-y-1">
              <div className="text-sm font-medium">{selectedMember?.name}</div>
              <div className="text-xs text-muted-foreground">
                {selectedMember?.email}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  Current role:
                </span>
                {selectedMember && <RoleBadge role={selectedMember.role} />}
              </div>
            </div>

            {/* New Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select
                value={newRole}
                onValueChange={(value: User["role"]) => setNewRole(value)}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Descriptions */}
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
              <div>
                <strong>Admin:</strong> Full access including team deletion
              </div>
              <div>
                <strong>Manager:</strong> Can approve, manage categories &
                events
              </div>
              <div>
                <strong>Member:</strong> Can submit expenses and view data
              </div>
              <div>
                <strong>Viewer:</strong> Read-only access
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleChangeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Alert Dialog */}
      {/* <AlertDialog
        open={isRemoveMemberDialogOpen}
        onOpenChange={setIsRemoveMemberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member from Team?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to remove{" "}
                <strong>{selectedMember?.name}</strong> from the team?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-1 text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <div className="font-medium text-yellow-900">
                      This action will:
                    </div>
                    <ul className="list-disc list-inside text-yellow-800 space-y-0.5">
                      <li>Immediately revoke all access permissions</li>
                      <li>Preserve their past expense records</li>
                      <li>Require a new invitation to rejoin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
      </>
      )}
    </div>
  );
}
