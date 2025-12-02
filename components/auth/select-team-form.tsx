"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "@/components/role-badge";
import { useTeams } from "@/providers/team-provider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldSeparator } from "@/components/ui/field";

export function SelectTeamForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { teams, loadingTeams, setTeamId } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const isSubmitting = useMemo(() => loadingTeams, [loadingTeams]);

  const handleSubmit = () => {
    if (!selectedTeamId) return;
    setTeamId(selectedTeamId);
    router.push("/main/expense-list");
  };

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <h2 className="text-2xl font-bold">Select Team</h2>
      <p className="text-sm text-muted-foreground">
        Select the team you want to use.
      </p>
      <Card className="py-0 rounded-md w-full">
        <CardContent className="p-0">
          <RadioGroup
            value={selectedTeamId ?? undefined}
            onValueChange={(value) => setSelectedTeamId(value)}
            className="w-full"
          >
            {teams.map((team, index) => (
              <div key={team.id}>
                <label
                  className="flex items-center justify-between py-4 px-6 cursor-pointer"
                  htmlFor={`team-${team.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={(team as any).icon} alt={team.name} />
                      <AvatarFallback className="rounded-lg">
                        {team.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{team.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={team.role} />
                    <RadioGroupItem
                      id={`team-${team.id}`}
                      value={team.id}
                      aria-label={`Select ${team.name}`}
                    />
                  </div>
                </label>
                {index !== teams.length - 1 && <Separator />}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      <Button
        onClick={handleSubmit}
        disabled={!selectedTeamId || isSubmitting || teams.length === 0}
        className="w-full gap-2"
      >
        <ArrowUpRight size={16} />
        Continue
      </Button>
      <Button variant="outline" type="button" className="w-full gap-2">
        <Plus size={16} />
        Create a new team
      </Button>
    </div>
  );
}
