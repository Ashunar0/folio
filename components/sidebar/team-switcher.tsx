"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, UserPlus, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTeam } from "@/providers/team-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { teams, teamId, setTeamId, currentTeamRole } = useTeam();
  const router = useRouter();
  const [lastActiveTeam, setLastActiveTeam] = React.useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);
  const [inviteInput, setInviteInput] = React.useState("");

  const handleJoinWithInvite = () => {
    const input = inviteInput.trim();
    if (!input) return;
    
    // Extract token from link format (/invite/xxx) or use as-is
    const linkMatch = input.match(/\/invite\/([a-f0-9-]+)/i);
    const token = linkMatch ? linkMatch[1] : input;
    
    setIsJoinDialogOpen(false);
    setInviteInput("");
    router.push(`/invite/${token}`);
  };

  const activeTeam = React.useMemo(() => {
    return teams.find((t) => t.id === teamId) ?? teams[0];
  }, [teams, teamId]);

  React.useEffect(() => {
    if (activeTeam) {
      setLastActiveTeam(activeTeam);
    }
  }, [activeTeam]);

  const displayTeam = activeTeam ?? lastActiveTeam;

  if (!displayTeam) {
    // If nothing available, render minimal placeholder without loading text to avoid flicker.
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="opacity-60 cursor-default"
            disabled
          >
            <div className="bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-sm font-semibold">
              ?
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate font-bold">No team</span>
              <span className="text-xs text-muted-foreground">Add a team</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-sm font-semibold">
                {displayTeam.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate font-bold">{displayTeam.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentTeamRole ?? "member"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => {
                  setTeamId(team.id);
                  // チーム切り替え時は必ずダッシュボードに遷移（権限のないページへのアクセスを防止）
                  router.push(`/${team.id}/dashboard`);
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border text-xs font-semibold">
                  {team.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{team.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {team.role}
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setIsJoinDialogOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <UserPlus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Join Team</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => {
                window.location.href = "/create-team";
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Create Team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Join Team Dialog */}
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join a Team</DialogTitle>
              <DialogDescription>
                Paste your invite link to join an existing team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="invite-link">Invite Link</Label>
              <Input
                id="invite-link"
                placeholder="https://example.com/invite/... or token"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinWithInvite();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoinWithInvite} disabled={!inviteInput.trim()}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Join Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
