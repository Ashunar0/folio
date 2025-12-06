"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

const CreateTeamForm = dynamic(
  () =>
    import("@/components/auth/create-team-form").then(
      (mod) => mod.CreateTeamForm
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[200px] items-center justify-center">
        <Spinner className="h-4 w-4" />
      </div>
    ),
  }
);

export default function CreateTeamLazy(
  props: React.ComponentProps<typeof CreateTeamForm>
) {
  return <CreateTeamForm {...props} />;
}
