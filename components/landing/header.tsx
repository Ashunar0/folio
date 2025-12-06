import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LandingHeaderProps {
  isAuthenticated?: boolean;
  dashboardUrl?: string;
}

export function LandingHeader({ isAuthenticated, dashboardUrl = "/onboarding" }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span>Folio</span>
        </div>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href={dashboardUrl}>
              <Button size="sm" className="gap-2">
                ダッシュボードへ <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  無料で始める
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
