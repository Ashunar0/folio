"use client";

import * as React from "react";
import {
  IconDashboard,
  IconFileDescription,
  IconList,
  IconListDetails,
  IconSettings,
  IconReport,
  IconUsers,
  IconCheck,
  IconSettingsCog,
} from "@tabler/icons-react";

import { NavSecondary } from "./nav-secondary";
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

const data = {
  main: [
    {
      title: "Dashboard",
      url: "/main/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Expense Form",
      url: "/main/expense-form",
      icon: IconFileDescription,
    },
    {
      title: "Expense List",
      url: "/main/expense-list",
      icon: IconListDetails,
    },
    {
      title: "Transactions",
      url: "/main/transactions",
      icon: IconList,
    },
  ],
  management: [
    {
      title: "Approval",
      url: "/management/approval",
      icon: IconCheck,
    },
    {
      title: "Users",
      url: "/management/users",
      icon: IconUsers,
    },
    {
      title: "Team Settings",
      url: "/management/team-settings",
      icon: IconSettingsCog,
    },
  ],
  other: [
    {
      title: "Settings",
      url: "/other/settings",
      icon: IconSettings,
    },
    {
      title: "Report",
      url: "/other/report",
      icon: IconReport,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = useSupabase();
  const { user } = useAuth();

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

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Main" items={data.main} />
        <NavGroup label="Management" items={data.management} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.other} />
        {user ? (
          <NavUser user={displayUser} />
        ) : (
          <NavUser user={{ name: "Guest", email: "", avatar: undefined }} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
