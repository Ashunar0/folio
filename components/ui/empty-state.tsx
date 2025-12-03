import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
};

export function EmptyState({
  icon = <Inbox />,
  title = "",
  description = "",
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
