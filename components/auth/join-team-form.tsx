"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import type { Invite } from "@/lib/schemas";

export function JoinTeamForm({
  invite,
  className,
  ...props
}: React.ComponentProps<"div"> & { invite: Invite }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleJoin() {
    setIsLoading(true);
    try {
      const { data: teamId, error } = await supabase.rpc("accept_invite", {
        p_token: invite.token,
      });

      if (error) {
        throw error;
      }

      // Update localStorage with new teamId so TeamProvider uses it
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id && teamId) {
        const storageKey = `folio:last-team:${user.id}`;
        window.localStorage.setItem(storageKey, teamId);
      }

      toast.success(`${invite.teamName}に参加しました`);
      
      console.log("Joined team:", teamId);
      
      // Wait a bit to ensure DB propagation before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force full page reload with joined=true to bypass middleware membership check
      window.location.href = `/${teamId}/dashboard?joined=true`;
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("チームへの参加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <h2 className="text-2xl font-bold">Join Team</h2>
      <p className="text-sm text-muted-foreground text-center">
        You&apos;ve been invited to join a team
      </p>

      <Card className="w-full">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarFallback className="rounded-lg text-lg">
                {invite.teamName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-lg">{invite.teamName}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  You&apos;ll join as
                </span>
                <RoleBadge role={invite.role} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleJoin}
        className="w-full gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check size={16} />
        )}
        Join Team
      </Button>

      <Button
        variant="outline"
        type="button"
        className="w-full gap-2"
        onClick={() => router.push("/")}
        disabled={isLoading}
      >
        <ArrowRight size={16} className="rotate-180" />
        Cancel
      </Button>
    </div>
  );
}
