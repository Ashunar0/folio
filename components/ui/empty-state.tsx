import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>Nothing here yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first item.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
