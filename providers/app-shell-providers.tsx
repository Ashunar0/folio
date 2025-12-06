"use client";

import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/providers/app-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { TeamProvider } from "@/providers/team-provider";

type AppShellProvidersProps = {
  children: React.ReactNode;
  defaultTeamId: string | null;
};

export function AppShellProviders({
  children,
  defaultTeamId,
}: AppShellProvidersProps) {
  return (
    <AppProviders>
      <SupabaseProvider>
        <AuthProvider>
          <TeamProvider defaultTeamId={defaultTeamId}>
            {children}
            <Toaster position="top-right" />
          </TeamProvider>
        </AuthProvider>
      </SupabaseProvider>
    </AppProviders>
  );
}

type AuthShellProvidersProps = {
  children: React.ReactNode;
  defaultTeamId?: string | null;
};

export function AuthShellProviders({
  children,
  defaultTeamId = null,
}: AuthShellProvidersProps) {
  return (
    <AppProviders>
      <SupabaseProvider>
        <AuthProvider>
          <TeamProvider defaultTeamId={defaultTeamId}>
            {children}
            <Toaster position="top-right" />
          </TeamProvider>
        </AuthProvider>
      </SupabaseProvider>
    </AppProviders>
  );
}
