"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import {
  IconEye,
  IconUser,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from "@/lib/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { User } from "@/lib/schemas";
import { RoleBadge } from "@/components/role-badge";

type UsersTableMeta = {
  canManage?: boolean;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
};

// --- Status Badge ---
const statusBadge = {
  active: (
    <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/60 rounded-full">
      Active
    </Badge>
  ),
  invited: (
    <Badge className="bg-yellow-600/10 text-yellow-600 border-yellow-600/60 rounded-full">
      Invited
    </Badge>
  ),
  suspended: (
    <Badge className="bg-red-600/10 text-red-600 border-red-600/60 rounded-full">
      Suspended
    </Badge>
  ),
};

export const userColumns: ColumnDef<User>[] = [
  // --- Actions ---
  {
    id: "actions",
    cell: ({ table, row }) => {
      const meta = table.options.meta as UsersTableMeta | undefined;
      const canManage = Boolean(meta?.canManage);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta?.onView?.(row.original);
              }}
            >
              <IconEye size={16} />
              <span>View</span>
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    meta?.onEdit?.(row.original);
                  }}
                >
                  <IconPencil size={16} />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    meta?.onDelete?.(row.original);
                  }}
                >
                  <IconTrash size={16} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

  // --- Name ---
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconUser size={16} className="text-muted-foreground" />
        <span>{row.original.name}</span>
      </div>
    ),
  },

  // --- Email ---
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },

  // --- Role ---
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return <RoleBadge role={row.original.role} />;
    },
  },

  // --- Status ---
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return statusBadge[status];
    },
  },

  // --- Joined date ---
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
      return format(new Date(row.original.joinedAt), "yyyy/MM/dd");
    },
  },

  // --- Last Login ---
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const v = row.original.lastLogin;
      if (!v) return "ー";
      return format(new Date(v), "yyyy/MM/dd");
    },
  },
];
