"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Link2 } from "lucide-react";
import { Expense } from "@/lib/schemas";

// ステータス用バッジ
const statusLabel = {
  draft: (
    <Badge className="bg-gray-600/10 dark:bg-gray-600/20 hover:bg-gray-600/10 text-gray-500 border-gray-600/60 shadow-none rounded-full">
      下書き
    </Badge>
  ),
  submitted: (
    <Badge className="bg-amber-600/10 dark:bg-amber-600/20 hover:bg-amber-600/10 text-amber-500 border-amber-600/60 shadow-none rounded-full">
      申請中
    </Badge>
  ),
  approved: (
    <Badge className="bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600/10 text-emerald-500 border-emerald-600/60 shadow-none rounded-full">
      承認済
    </Badge>
  ),
  rejected: (
    <Badge className="bg-red-600/10 dark:bg-red-600/20 hover:bg-red-600/10 text-red-500 border-red-600/60 shadow-none rounded-full">
      差戻し
    </Badge>
  ),
};

export const columns: ColumnDef<Expense>[] = [
  {
    id: "actions",
    cell: ({ table, row }) => {
      const meta = table.options.meta as any;
      const canManageAll = Boolean(meta?.canManageAll);
      const currentUserId = meta?.currentUserId as string | undefined;
      const isOwner = row.original.createdBy === currentUserId;
      const canEditThis =
        (canManageAll || isOwner) &&
        (row.original.status === "draft" || row.original.status === "rejected");
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
            {canEditThis && (
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
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const value = row.original.date;
      return format(new Date(value), "yyyy/MM/dd");
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const v = row.original.amount;
      const formatted = v.toLocaleString();
      return v < 0 ? `-¥${Math.abs(v).toLocaleString()}` : `¥${formatted}`;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (row.original.type === "expense" ? "支出" : "収入"),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => row.original.event ?? "なし",
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return statusLabel[status];
    },
  },
  {
    accessorKey: "memo",
    header: "Memo",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.memo}
      </span>
    ),
  },
  {
    accessorKey: "receiptUrl",
    header: "Receipt",
    cell: ({ row, table }) => {
      const url = row.original.receiptUrl;
      const meta = table.options.meta as any;
      return url ? (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            meta?.onReceiptPreview?.(url);
          }}
        >
          <Link2 size={16} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground disabled hover:bg-transparent"
        >
          <span>-</span>
        </Button>
      );
    },
  },
];
