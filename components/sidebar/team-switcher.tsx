"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

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

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { teams, teamId, setTeamId, currentTeamRole } = useTeam();
  const [lastActiveTeam, setLastActiveTeam] = React.useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

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
                onClick={() => setTeamId(team.id)}
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
              onClick={() => {
                window.location.href = "/create-team";
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Create new team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
