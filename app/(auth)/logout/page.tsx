"use client";

import { signOut } from "@/lib/auth/api";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(createSupabaseBrowserClient());
    router.push("/login");
  };

  handleLogout();
}
