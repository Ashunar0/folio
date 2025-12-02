import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans_JP } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { TeamProvider } from "@/providers/team-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Folio",
  description: "Folio is a simple and easy-to-use expense tracking app",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultTeamId =
    process.env.NEXT_PUBLIC_SUPABASE_DEFAULT_TEAM_ID ?? null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${notoSansJP.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>
          <SupabaseProvider>
            <AuthProvider>
              <TeamProvider defaultTeamId={defaultTeamId}>
                {children}
              </TeamProvider>
            </AuthProvider>
          </SupabaseProvider>
        </AppProviders>
      </body>
    </html>
  );
}
