"use client";

import { useMemo } from "react";
import {
  IconDashboard,
  IconFileDescription,
  IconList,
  IconListDetails,
  IconUsers,
  IconCheck,
  IconSettingsCog,
  IconCategory,
  IconCalendar,
} from "@tabler/icons-react";

import { NavGroup } from "@/components/sidebar/nav-group";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "@/providers/team-provider";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

  const displayUser = {
    name: profileData?.name || user?.user_metadata?.full_name || "",
    email: profileData?.email || user?.email || "",
    avatar:
      profileData?.avatar_url || user?.user_metadata?.avatar_url || undefined,
  };

  const fallbackItems = useMemo(() => {
    const basePath = teamId ? `/${teamId}` : "/";
    const path = (segment: string) => `${basePath}/${segment}`;
    const isManagerOrAdmin =
      currentTeamRole === "admin" || currentTeamRole === "manager";

    return {
      general: [
        {
          title: "Dashboard",
          url: path("dashboard"),
          icon: IconDashboard,
        },
        {
          title: "Expense Form",
          url: path("expense-form"),
          icon: IconFileDescription,
        },
        {
          title: "Expense List",
          url: path("expense-list"),
          icon: IconListDetails,
        },
        {
          title: "Transactions",
          url: path("transactions"),
          icon: IconList,
        },
        { title: "Users", url: path("users"), icon: IconUsers },
      ],
      management: isManagerOrAdmin
        ? [
            {
              title: "Approval",
              url: path("approval"),
              icon: IconCheck,
            },
            {
              title: "Categories",
              url: path("categories"),
              icon: IconCategory,
            },
            {
              title: "Events",
              url: path("events"),
              icon: IconCalendar,
            },
            {
              title: "Team Settings",
              url: path("settings"),
              icon: IconSettingsCog,
            },
          ]
        : [],
    };
  }, [teamId, currentTeamRole]);

  const items = {
    general: fallbackItems.general ?? [],
    management: fallbackItems.management ?? [],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {items.general.length > 0 && (
          <NavGroup label="General" items={items.general} />
        )}
        {items.management.length > 0 && (
          <NavGroup label="Management" items={items.management} />
        )}
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser user={displayUser} />
        ) : (
          <NavUser user={{ name: "Guest", email: "", avatar: undefined }} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
