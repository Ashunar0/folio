"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export type CreateInviteResult = {
  success: boolean;
  error?: string;
  invite?: any;
};

export async function createInvite(
  teamId: string,
  role: string,
  expiresInDays: number | null
): Promise<CreateInviteResult> {
  const supabase = await createClient();

  try {
    // Check permissions (admin or manager)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate expires_at
    let expiresAt = null;
    if (expiresInDays) {
      const date = new Date();
      date.setDate(date.getDate() + expiresInDays);
      expiresAt = date.toISOString();
    }

    const { data, error } = await supabase
      .from("invites")
      .insert({
        team_id: teamId,
        role: role,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invite:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/app/${teamId}/settings`);
    return { success: true, invite: data };
  } catch (error) {
    console.error("Unexpected error creating invite:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function revokeInvite(
  teamId: string,
  inviteToken: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("invites")
      .delete()
      .eq("token", inviteToken)
      .eq("team_id", teamId); // Ensure it belongs to the team

    if (error) {
      console.error("Error revoking invite:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/app/${teamId}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Unexpected error revoking invite:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
