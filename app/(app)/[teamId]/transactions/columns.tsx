"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link2 } from "lucide-react";
import { Transaction } from "@/lib/schemas";

export const columns: ColumnDef<Transaction>[] = [
  // --- Actions ---
  {
    id: "actions",
    cell: ({ table, row }) => {
      const meta = table.options.meta as any;
      const canManageAll = Boolean(meta?.canManageAll);
      const currentUserId = meta?.currentUserId as string | undefined;
      const isOwner = row.original.createdBy === currentUserId;
      const canEditThis = canManageAll || isOwner;
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
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta?.onEdit?.(row.original);
              }}
              disabled={!canEditThis}
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
              disabled={!canEditThis}
            >
              <IconTrash size={16} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

  // --- Date ---
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.original.date), "yyyy/MM/dd");
    },
  },

  // --- Type ---
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return type === "expense" ? (
        <IconArrowDownRight className="text-red-500" size={18} />
      ) : (
        <IconArrowUpRight className="text-emerald-500" size={18} />
      );
    },
  },

  // --- Amount ---
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const v = row.original.amount;
      const formatted = Math.abs(v).toLocaleString();
      return v < 0 ? `-¥${formatted}` : `¥${formatted}`;
    },
  },

  // --- Category ---
  {
    accessorKey: "category",
    header: "Category",
  },

  // --- Event ---
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => row.original.event ?? "ー",
  },

  // --- Created By ---
  {
    accessorKey: "createdBy",
    header: "Member",
  },

  // --- Memo ---
  {
    accessorKey: "memo",
    header: "Memo",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.memo}
      </span>
    ),
  },

  // --- Receipt ---
  {
    accessorKey: "receiptUrl",
    header: "Receipt",
    cell: ({ row }) => {
      const url = row.original.receiptUrl;
      return url ? <Link2 size={16} className="text-muted-foreground" /> : "ー";
    },
  },
];
