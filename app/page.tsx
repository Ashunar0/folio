import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { createClient } from "@/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // ログイン済みユーザーのダッシュボードURLを取得
  let dashboardUrl = "/onboarding";
  if (user) {
    const { data: teams } = await supabase
      .from("team_users")
      .select("team_id")
      .eq("user_id", user.id)
      .limit(1);
    
    if (teams && teams.length > 0) {
      dashboardUrl = `/${teams[0].team_id}/dashboard`;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader isAuthenticated={isAuthenticated} dashboardUrl={dashboardUrl} />
      <main className="flex-1">
        <LandingHero isAuthenticated={isAuthenticated} dashboardUrl={dashboardUrl} />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  );
}

