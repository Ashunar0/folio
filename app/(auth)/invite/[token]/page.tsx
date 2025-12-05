import { createClient } from "@/supabase/server";
import { JoinTeamForm } from "@/components/auth/join-team-form";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Invite } from "@/lib/schemas";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Store token in URL and redirect to login
    return redirect(`/login?redirect=/invite/${token}`);
  }

  // Fetch invite details
  const { data: inviteData, error } = await supabase
    .from("invites")
    .select("token, team_id, role, expires_at")
    .eq("token", token)
    .single();

  console.log("Token:", token);
  console.log("Invite data:", JSON.stringify(inviteData, null, 2));
  console.log("Error:", error);

  if (error || !inviteData) {
    return (
      <div className="flex w-full justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid Invite</AlertTitle>
                <AlertDescription>
                  This invite link is invalid or has expired.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch team info separately
  const { data: teamData } = await supabase
    .from("teams")
    .select("name")
    .eq("id", inviteData.team_id)
    .single();

  console.log("Team data:", teamData);

  // Check if invite is expired
  if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
    return (
      <div className="flex w-full justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Expired Invite</AlertTitle>
                <AlertDescription>
                  This invite link has expired.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("team_users")
    .select("team_id")
    .eq("team_id", inviteData.team_id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    // Already a member - redirect to dashboard
    redirect(`/${inviteData.team_id}/dashboard`);
  }

  const invite: Invite = {
    token: inviteData.token,
    teamId: inviteData.team_id,
    teamName: teamData?.name ?? "Unknown Team",
    role: inviteData.role as Invite["role"],
    expiresAt: inviteData.expires_at,
  };

  return (
    <div className="flex w-full justify-center">
      <JoinTeamForm invite={invite} className="w-full max-w-md" />
    </div>
  );
}
