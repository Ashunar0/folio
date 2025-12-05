"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { userColumns } from "./column";
import { UserSheet } from "@/components/sheets/user-sheet";
import { User } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useUsers } from "@/lib/api/users";
import { useAuth } from "@/providers/auth-provider";
import { useTeam } from "@/providers/team-provider";

export default function UsersClient() {
  const router = useRouter();
  const { authLoading } = useAuth();
  const { teamId, loadingTeams, currentTeamRole } = useTeam();
  const { data, isLoading, error } = useUsers();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const canManageMembers = ["admin", "manager"].includes(
    currentTeamRole ?? ""
  );

  const handleRowClick = (row: User) => {
    setIsEditMode(false);
    setSelectedUser(row);
    setIsSheetOpen(true);
  };

  const handleView = (row: User) => {
    setIsEditMode(false);
    setSelectedUser(row);
    setIsSheetOpen(true);
  };

  const handleEdit = (row: User) => {
    if (!canManageMembers) {
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
    setSelectedUser(row);
    setIsSheetOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-2">
            View all team members and their roles.
          </p>
        </div>

        {canManageMembers && (
          <Button 
            onClick={() => router.push('/management/team-settings#members')}
            variant="outline"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Members
          </Button>
        )}
      </div>
      
      <DataTable
        data={data ?? []}
        columns={userColumns}
        onRowClick={handleRowClick}
        searchColumn="name"
        searchPlaceholder="Search by name..."
        filters={[
          {
            column: "role",
            label: "Role",
            options: [
              { value: "admin", label: "Admin" },
              { value: "manager", label: "Manager" },
              { value: "member", label: "Member" },
              { value: "viewer", label: "Viewer" },
            ],
          },
          {
            column: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "invited", label: "Invited" },
              { value: "suspended", label: "Suspended" },
            ],
          },
        ]}
        meta={{
          onView: handleView,
          onEdit: handleEdit,
          canManage: canManageMembers,
        }}
      />

      {(authLoading || loadingTeams || isLoading) && (
        <p className="text-sm text-muted-foreground mt-4">Loading...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-4">
          Failed to load users: {error.message}
        </p>
      )}
      {!teamId && !loadingTeams && (
        <p className="text-sm text-muted-foreground mt-4">
          No team selected. Join or create a team.
        </p>
      )}

      <UserSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        user={selectedUser}
        defaultEditMode={isEditMode}
        canEdit={canManageMembers}
      />
    </div>
  );
}
