import {
  IconDashboard,
  IconFileDescription,
  IconListDetails,
  IconList,
  IconCheck,
  IconUsers,
  IconSettingsCog,
} from "@tabler/icons-react";

// サイドバー項目を teamId に応じて生成する
export function getSidebarItems(teamId: string, role: string) {
  const basePath = `/app/${teamId}`;

  // 一般ユーザー向け
  const general = [
    {
      title: "Dashboard",
      url: `${basePath}/dashboard`,
      icon: IconDashboard,
    },
    {
      title: "Expense Form",
      url: `${basePath}/expense-form`,
      icon: IconFileDescription,
    },
    {
      title: "Expense List",
      url: `${basePath}/expense-list`,
      icon: IconListDetails,
    },
    {
      title: "Transactions",
      url: `${basePath}/transactions`,
      icon: IconList,
    },
  ];

  // 管理者 / マネージャーのみ
  const management =
    role === "admin" || role === "manager"
      ? [
          {
            title: "Approval",
            url: `${basePath}/approval`,
            icon: IconCheck,
          },
          {
            title: "Users",
            url: `${basePath}/users`,
            icon: IconUsers,
          },
          {
            title: "Team Settings",
            url: `${basePath}/settings`,
            icon: IconSettingsCog,
          },
        ]
      : [];

  return {
    general,
    management,
  };
}
