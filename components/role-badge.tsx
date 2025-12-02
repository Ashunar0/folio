import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/schemas";
import { Eye, ShieldCheck, UserCog, UserRound } from "lucide-react";

interface RoleBadgeProps {
  role: User["role"];
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "admin":
      return (
        <Badge
          variant="outline"
          className="bg-amber-600/10 text-amber-600 border-amber-600/50 rounded-full gap-1.5"
        >
          <ShieldCheck size={14} />
          <span>Admin</span>
        </Badge>
      );
    case "manager":
      return (
        <Badge
          variant="outline"
          className="bg-blue-600/10 text-blue-600 border-blue-600/50 rounded-full gap-1.5"
        >
          <UserCog size={14} />
          <span>Manager</span>
        </Badge>
      );
    case "member":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-600/10 text-emerald-600 border-emerald-600/50 rounded-full gap-1.5"
        >
          <UserRound size={14} />
          <span>Member</span>
        </Badge>
      );
    case "viewer":
      return (
        <Badge
          variant="outline"
          className="bg-gray-600/10 text-gray-600 border-gray-600/60 rounded-full gap-1.5"
        >
          <Eye size={14} />
          <span>Viewer</span>
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}
