"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconEye } from "@/lib/icons";
import { Link2 } from "lucide-react";
import { Expense } from "@/lib/schemas";

interface TableMeta {
  onEdit?: (expense: Expense) => void;
  onReceiptPreview?: (url: string) => void;
}

export const approvalColumns: ColumnDef<Expense>[] = [
  // === Actions（承認/却下）===========================================
  {
    id: "actions",
    cell: ({ table, row }) => {
      const expense = row.original;
      const meta = table.options.meta as TableMeta | undefined;

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

          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta?.onEdit?.(expense);
              }}
            >
              <IconEye size={16} />
              <span>Review</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

  // === Date ==========================================================
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const value = row.original.date;
      return format(new Date(value), "yyyy/MM/dd");
    },
  },

  // === Amount ========================================================
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const v = row.original.amount;
      const formatted = v.toLocaleString();
      return v < 0 ? `-¥${Math.abs(v).toLocaleString()}` : `¥${formatted}`;
    },
  },

  // === Category ======================================================
  {
    accessorKey: "category",
    header: "Category",
  },

  // === Event =========================================================
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => row.original.event ?? "なし",
  },

  // === Created By ====================================================
  {
    accessorKey: "createdBy",
    header: "Created By",
  },

  // === Memo ==========================================================
  {
    accessorKey: "memo",
    header: "Memo",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.memo}
      </span>
    ),
  },

  // === Receipt =======================================================
  {
    accessorKey: "receiptUrl",
    header: "Receipt",
    cell: ({ row, table }) => {
      const url = row.original.receiptUrl;
      const meta = table.options.meta as TableMeta | undefined;
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
