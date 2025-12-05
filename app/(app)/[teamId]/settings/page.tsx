import { createClient } from "@/supabase/server";
import TeamSettingsClient from "./client";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const supabase = await createClient();
  const { teamId } = await params;

  const { data: invites } = await supabase
    .from("invites")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  const formattedInvites = invites?.map((invite) => ({
    id: invite.token,
    token: invite.token,
    link: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invite.token}`,
    defaultRole: invite.role,
    expiresAt: invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "Never",
    maxUses: 9999, // Unlimited
    usedCount: 0,
    createdBy: "User", // Placeholder as we only have ID
    createdAt: invite.created_at,
  })) || [];

  return <TeamSettingsClient teamId={teamId} initialInvitations={formattedInvites} />;
}
