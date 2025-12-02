"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Format the segment to be capitalized and hyphenated
  const formatSegment = (segment?: string) => {
    if (!segment) return "Home";
    return decodeURIComponent(segment)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const topCrumbLabel = segments.some((segment) =>
    ["approval", "settings"].includes(segment.toLowerCase())
  )
    ? "Management"
    : "General";

  const lastSegment = segments[segments.length - 1];
  const lastCrumbLabel = formatSegment(lastSegment);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b">
      <div className="flex items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>{topCrumbLabel}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{lastCrumbLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-3">
        <Link href="/main/expense-form">
          <Button>
            <Plus />
            Quick Create
          </Button>
        </Link>
      </div>
    </header>
  );
}
