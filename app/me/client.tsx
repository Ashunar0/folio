"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  History,
  LogOut,
  Pencil,
  Settings,
  Upload,
  Trash,
  UserRound,
  UsersRound,
} from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import { User as UserType } from "@/lib/schemas";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProfileClient() {
  // Mock Data
  const user = {
    name: "川野辺 旭",
    username: "asahi.kawanobe",
    email: "asahi@example.com",
    avatar: "https://github.com/shadcn.png",
    circle: "軽音サークル",
    role: "Manager",
    status: "Active",
    joinedAt: "2024-04-01",
    lastLogin: "2025-04-15 10:23",
  };

  const activities = [
    {
      id: 1,
      action: "申請を作成しました",
      target: "新歓コンパの飲食費",
      time: "2時間前",
    },
    {
      id: 2,
      action: "ステータスが変更されました",
      target: "スタジオ代 (申請中 -> 承認済)",
      time: "1日前",
    },
    {
      id: 3,
      action: "プロフィールを更新しました",
      target: "アイコン画像",
      time: "3日前",
    },
    {
      id: 4,
      action: "ログインしました",
      target: "Chrome on MacOS",
      time: "1週間前",
    },
  ];

  const teams: {
    id: number;
    name: string;
    role: UserType["role"];
    members: number;
    icon: string;
  }[] = [
    {
      id: 1,
      name: "Acme Corp",
      role: "admin",
      members: 12,
      icon: "https://avatar.vercel.sh/acme",
    },
    {
      id: 2,
      name: "Design Team",
      role: "member",
      members: 5,
      icon: "https://avatar.vercel.sh/design",
    },
    {
      id: 3,
      name: "Engineering",
      role: "manager",
      members: 24,
      icon: "https://avatar.vercel.sh/engineering",
    },
  ];

  const themes = [
    { name: "Neutral", color: "#0F172A" },
    { name: "Blue", color: "#3B82F6" },
    { name: "Emerald", color: "#10B981" },
    { name: "Amber", color: "#F59E0B" },
    { name: "Purple", color: "#8B5CF6" },
    { name: "Rose", color: "#F43F5E" },
    { name: "Slate", color: "#64748B" },
  ];

  const [selectedTheme, setSelectedTheme] = useState("Neutral");

  return (
    <div className="w-full max-w-3xl space-y-10">
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
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
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

            {/* Email */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Email</div>
                <div className="text-xs text-muted-foreground">
                  Your email address
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground text-sm">
                  {user.email}
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />

            {/* Full Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Name</div>
                <div className="text-xs text-muted-foreground">
                  Your full name
                </div>
              </div>
              <div className="w-full sm:w-1/3">
                <Input defaultValue={user.name} className="h-9 text-sm" />
              </div>
            </div>
            <Separator />

            {/* Username */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 gap-4 sm:gap-0">
              <div className="space-y-0.5">
                <div className="text-sm">Username</div>
                <div className="text-xs text-muted-foreground">
                  Nickname or first name, however you want to be called
                </div>
              </div>
              <div className="w-full sm:w-1/3">
                <Input defaultValue={user.username} className="h-9 text-sm" />
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
            {teams.map((team, index) => (
              <div key={team.id}>
                <div className="flex items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={team.icon} alt={team.name} />
                      <AvatarFallback className="rounded-lg">
                        {team.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{team.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {team.members} members
                      </div>
                    </div>
                  </div>
                  <RoleBadge role={team.role} />
                </div>
                {index !== teams.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Section 4: 最近のアクティビティ */}
      <section className="space-y-4">
        <h3 className="text-lg flex items-center gap-2">
          <History size={20} />
          Recent Activities
        </h3>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center gap-4 p-4 ${
                  index !== activities.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.target}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Section 5: 個人設定 */}
      <section className="space-y-4">
        <h3 className="text-lg flex items-center gap-2">
          <Settings size={18} />
          Settings
        </h3>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Password Change */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Password</div>
                <div className="text-xs text-muted-foreground">
                  Change your password regularly
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            <Separator />

            {/* Notification */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive email notifications
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />

            {/* Theme Color */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Theme Color</div>
                <div className="text-xs text-muted-foreground">
                  Select your preferred accent color
                </div>
              </div>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.name} value={theme.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span>{theme.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* Dark Mode */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Dark Mode</div>
                <div className="text-xs text-muted-foreground">
                  Toggle dark mode
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 6: ログアウト */}
      <section className="flex justify-start pt-4 pb-10">
        <Button
          variant="outline"
          className="gap-2 px-8 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <LogOut size={16} />
          Log out
        </Button>
      </section>
    </div>
  );
}
