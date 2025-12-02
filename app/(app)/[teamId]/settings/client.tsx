"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Calendar,
  Copy,
  Database,
  Download,
  ExternalLink,
  GripVertical,
  Link as LinkIcon,
  List,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Shield,
  Trash,
  Upload,
  Users,
  UserPlus,
  Pen,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { RoleBadge } from "@/components/role-badge";
import { User } from "@/lib/schemas";
import { userTestData } from "@/lib/testData";

export default function TeamSettingsClient() {
  // Mock Data
  const team = {
    name: "Acme Corp",
    id: "team_123456789",
    icon: "https://avatar.vercel.sh/acme",
    description: "Main workspace for Acme Corporation financial management.",
  };

  const [expenseCategories, setExpenseCategories] = useState([
    { id: 1, name: "Travel" },
    { id: 2, name: "Meals" },
    { id: 3, name: "Software" },
    { id: 4, name: "Office Supplies" },
  ]);

  const [events, setEvents] = useState([
    { id: 1, name: "Q1 Planning" },
    { id: 2, name: "Team Building" },
    { id: 3, name: "Annual Conference" },
  ]);

  const [invitations, setInvitations] = useState([
    {
      id: 1,
      token: "inv_abc123xyz",
      link: "https://app.example.com/invite/inv_abc123xyz",
      defaultRole: "member",
      expiresAt: "2025-12-31",
      createdBy: "Admin User",
      createdAt: "2025-11-20",
      maxUses: 10,
      usedCount: 3,
    },
    {
      id: 2,
      token: "inv_def456uvw",
      link: "https://app.example.com/invite/inv_def456uvw",
      defaultRole: "viewer",
      expiresAt: "2025-12-15",
      createdBy: "Manager User",
      createdAt: "2025-11-25",
      maxUses: 5,
      usedCount: 0,
    },
  ]);

  // Mock: 実際にはログインユーザーの権限を取得
  const userRole = "admin"; // or "manager", "member", "viewer"
  const canInvite = ["admin", "manager"].includes(userRole);
  const canRevokeInvite = userRole === "admin";

  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  // Form states for invite dialog
  const [inviteRole, setInviteRole] = useState<"member" | "viewer">("member");
  const [inviteExpiry, setInviteExpiry] = useState("7");
  const [inviteMaxUses, setInviteMaxUses] = useState("10");

  // Form state for role change
  const [newRole, setNewRole] = useState<User["role"]>("member");

  // Handlers
  const handleGenerateInvite = () => {
    console.log("🔗 Generating invitation link:", {
      defaultRole: inviteRole,
      expiresInDays: inviteExpiry,
      maxUses: inviteMaxUses,
      createdBy: userRole,
      timestamp: new Date().toISOString(),
    });
    setIsInviteDialogOpen(false);
    // Reset form
    setInviteRole("member");
    setInviteExpiry("7");
    setInviteMaxUses("10");
  };

  const handleCopyInvite = (link: string) => {
    console.log("📋 Copying invitation link:", link);
    // 実際の実装: navigator.clipboard.writeText(link)
  };

  const handleRevokeInvite = (inviteId: number) => {
    console.log("🗑️ Revoking invitation:", {
      inviteId,
      revokedBy: userRole,
      timestamp: new Date().toISOString(),
    });
  };

  const handleOpenRoleChange = (member: User) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setIsRoleChangeDialogOpen(true);
  };

  const handleChangeRole = () => {
    if (!selectedMember) return;
    console.log("👤 Changing user role:", {
      userId: selectedMember.id,
      userName: selectedMember.name,
      oldRole: selectedMember.role,
      newRole: newRole,
      changedBy: userRole,
      timestamp: new Date().toISOString(),
    });
    setIsRoleChangeDialogOpen(false);
    setSelectedMember(null);
  };

  const handleOpenRemoveMember = (member: User) => {
    setSelectedMember(member);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    console.log("❌ Removing member from team:", {
      userId: selectedMember.id,
      userName: selectedMember.name,
      userEmail: selectedMember.email,
      removedBy: userRole,
      timestamp: new Date().toISOString(),
    });
    setIsRemoveMemberDialogOpen(false);
    setSelectedMember(null);
  };

  // Drag and Drop Logic for Categories
  const dragCategoryItem = useRef<number | null>(null);
  const dragOverCategoryItem = useRef<number | null>(null);

  const handleCategoryDragStart = (index: number) => {
    dragCategoryItem.current = index;
  };

  const handleCategoryDragEnter = (index: number) => {
    dragOverCategoryItem.current = index;
  };

  const handleCategoryDragEnd = () => {
    const dragIndex = dragCategoryItem.current;
    const dragOverIndex = dragOverCategoryItem.current;

    if (
      dragIndex !== null &&
      dragOverIndex !== null &&
      dragIndex !== dragOverIndex
    ) {
      const _expenseCategories = [...expenseCategories];
      const draggedItemContent = _expenseCategories[dragIndex];
      _expenseCategories.splice(dragIndex, 1);
      _expenseCategories.splice(dragOverIndex, 0, draggedItemContent);
      setExpenseCategories(_expenseCategories);
    }

    dragCategoryItem.current = null;
    dragOverCategoryItem.current = null;
  };

  // Drag and Drop Logic for Events
  const dragEventItem = useRef<number | null>(null);
  const dragOverEventItem = useRef<number | null>(null);

  const handleEventDragStart = (index: number) => {
    dragEventItem.current = index;
  };

  const handleEventDragEnter = (index: number) => {
    dragOverEventItem.current = index;
  };

  const handleEventDragEnd = () => {
    const dragIndex = dragEventItem.current;
    const dragOverIndex = dragOverEventItem.current;

    if (
      dragIndex !== null &&
      dragOverIndex !== null &&
      dragIndex !== dragOverIndex
    ) {
      const _events = [...events];
      const draggedItemContent = _events[dragIndex];
      _events.splice(dragIndex, 1);
      _events.splice(dragOverIndex, 0, draggedItemContent);
      setEvents(_events);
    }

    dragEventItem.current = null;
    dragOverEventItem.current = null;
  };

  return (
    <div className="w-full max-w-3xl space-y-10 py-8 mx-auto">
      <h1 className="text-3xl font-bold">Team Settings</h1>

      {/* Section 1: General */}
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
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-10 w-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={team.icon} alt={team.name} />
                    <AvatarFallback className="rounded-lg">AC</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload new picture</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Remove picture</span>
                  </DropdownMenuItem>
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
                <Input defaultValue={team.name} className="h-9 text-sm" />
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Copy ID</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-copy"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            </div>
            <Separator />

            {/* Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Description</div>
                <div className="text-xs text-muted-foreground">
                  Brief description of your team
                </div>
              </div>
              <div className="w-full sm:w-2/3">
                <Input
                  defaultValue={team.description}
                  className="h-9 text-sm"
                />
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

      {/* Section 3: Category Management */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <List size={18} />
          Category Management
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-6 space-y-6">
            {/* Expense Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Expense Categories</h3>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="mr-2 h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="border rounded-md divide-y">
                {expenseCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 group cursor-move"
                    draggable
                    onDragStart={() => handleCategoryDragStart(index)}
                    onDragEnter={() => handleCategoryDragEnter(index)}
                    onDragEnd={handleCategoryDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3 pointer-events-none">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset to defaults
                </Button>
              </div>
            </div>

            <Separator />

            {/* Income Categories (Mock) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Income Categories</h3>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="mr-2 h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md text-center border border-dashed">
                No income categories configured.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Event Management */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Calendar size={18} />
          Event Management
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-6 space-y-6">
            {/* Input Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Event Input Mode</Label>
              <RadioGroup defaultValue="select" className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="select" id="r1" />
                  <Label
                    htmlFor="r1"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Select from Master
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="r2" />
                  <Label
                    htmlFor="r2"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Free Input
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Event List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Event Master</h3>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="mr-2 h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="border rounded-md divide-y">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 group cursor-move"
                    draggable
                    onDragStart={() => handleEventDragStart(index)}
                    onDragEnter={() => handleEventDragEnter(index)}
                    onDragEnd={handleEventDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3 pointer-events-none">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{event.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                            onClick={() => handleCopyInvite(invite.link)}
                          >
                            <Copy className="h-3 w-3" />
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
            {userRole === "admin" && (
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
            )}

            {userRole === "admin" && <Separator />}
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
      <AlertDialog
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
      </AlertDialog>
    </div>
  );
}
