import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppShellProviders } from "@/providers/app-shell-providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultTeamId =
    process.env.NEXT_PUBLIC_SUPABASE_DEFAULT_TEAM_ID ?? null;

  return (
    <AppShellProviders defaultTeamId={defaultTeamId}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="sticky top-0 z-10 bg-background w-full">
            <SiteHeader />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppShellProviders>
  );
}
