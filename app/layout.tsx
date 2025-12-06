import localFont from "next/font/local";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { TeamProvider } from "@/providers/team-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "../public/fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const inter = localFont({
  src: "../public/fonts/Inter-VariableFont.ttf",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const notoSansJP = localFont({
  src: "../public/fonts/NotoSansJP-VariableFont.ttf",
  variable: "--font-noto-sans-jp",
  weight: "100 900",
  style: "normal",
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
                <Toaster position="top-right" />
              </TeamProvider>
            </AuthProvider>
          </SupabaseProvider>
        </AppProviders>
      </body>
    </html>
  );
}
