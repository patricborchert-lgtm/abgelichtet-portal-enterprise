import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/app";

interface StatusBadgeProps {
  active?: boolean;
  status?: ProjectStatus;
}

export function StatusBadge({ active, status }: StatusBadgeProps) {
  if (typeof active === "boolean") {
    return <Badge variant={active ? "success" : "destructive"}>{active ? "Active" : "Inactive"}</Badge>;
  }

  switch (status) {
    case "planned":
      return <Badge variant="outline">Planned</Badge>;
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "review":
      return <Badge variant="secondary">Review</Badge>;
    case "delivered":
      return <Badge variant="success">Delivered</Badge>;
    case "archived":
      return <Badge variant="destructive">Archived</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
