"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Upload,
  Trash,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/role-badge";
import { User as UserType } from "@/lib/schemas";
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
    </div>
  );
}
