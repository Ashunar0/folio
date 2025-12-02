"use client";

import { useMemo } from "react";
import {
  IconUser,
  IconKey,
  IconPalette,
  IconBell,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { ChevronLeft } from "lucide-react";

import { NavGroup } from "@/components/sidebar/nav-group";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "@/providers/team-provider";
import Link from "next/link";

export const meSidebarItems = [
  {
    title: "Profile",
    url: "/me/profile",
    icon: IconUser,
  },
  {
    title: "Account",
    url: "/me/account",
    icon: IconKey,
  },
  {
    title: "Appearance",
    url: "/me/appearance",
    icon: IconPalette,
  },
  {
    title: "Notifications",
    url: "/me/notifications",
    icon: IconBell,
  },
];

export function MeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const { teamId, currentTeamRole } = useTeam();

  const { data: profileData } = useQuery({
    queryKey: ["sidebar-profile", user?.id],
    enabled: Boolean(user?.id),
    placeholderData: (prev) => prev,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const fallbackPath = useMemo(() => {
    const basePath = teamId ? `/${teamId}/dashboard` : "/";

    return basePath;
  }, [teamId]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Link
          href={fallbackPath}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2"
        >
          <ChevronLeft />
          <span>Back to App</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={meSidebarItems} />
      </SidebarContent>
    </Sidebar>
  );
}
