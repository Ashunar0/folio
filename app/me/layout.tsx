import { MeSidebar } from "@/components/me/me-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MeSidebar />
      <SidebarInset>
        <div className="sticky top-0 z-10 bg-background w-full">
          <SiteHeader />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
