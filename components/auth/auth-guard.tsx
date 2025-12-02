"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const search = new URLSearchParams();
      search.set("redirectedFrom", pathname || "/");
      router.replace(`/login?${search.toString()}`);
    }
  }, [authLoading, user, router, pathname]);

  if (authLoading) return null;
  if (!user) return null;
  return <>{children}</>;
}
