import { signOut } from "@/lib/auth/api";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LogoutPage() {
  const handleLogout = async () => {
    await signOut(createSupabaseBrowserClient());
    window.location.href = "/login";
  };

  handleLogout();
}
