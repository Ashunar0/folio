"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Link as LinkIcon } from "lucide-react";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState("");

  const handleCreateTeam = () => {
    router.push("/create-team");
  };

  const handleJoinWithToken = () => {
    if (inviteToken.trim()) {
      router.push(`/invite/${inviteToken.trim()}`);
    }
  };

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <h2 className="text-2xl font-bold">Welcome to Folio</h2>
      <p className="text-sm text-muted-foreground text-center">
        You&apos;re not part of any team yet. Get started by creating a new team or joining an existing one.
      </p>

      <Card className="w-full">
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Create a New Team</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Start fresh by creating your own team
            </p>
            <Button onClick={handleCreateTeam} className="w-full gap-2">
              <Plus size={16} />
              Create Team
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Join with Invite</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Have an invite link? Paste the token here
            </p>
            <div className="space-y-2">
              <Label htmlFor="invite-token">Invite Token</Label>
              <Input
                id="invite-token"
                placeholder="e.g., a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleJoinWithToken();
                  }
                }}
              />
              <Button
                onClick={handleJoinWithToken}
                variant="outline"
                className="w-full gap-2"
                disabled={!inviteToken.trim()}
              >
                <LinkIcon size={16} />
                Join Team
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
