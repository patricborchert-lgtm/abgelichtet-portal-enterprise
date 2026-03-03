import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/app";

interface StatusBadgeProps {
  active?: boolean;
  status?: ProjectStatus;
}

export function StatusBadge({ active, status }: StatusBadgeProps) {
  if (typeof active === "boolean") {
    return <Badge variant={active ? "success" : "destructive"}>{active ? "Aktiv" : "Inaktiv"}</Badge>;
  }

  switch (status) {
    case "planned":
      return <Badge variant="outline">Planung</Badge>;
    case "active":
      return <Badge variant="default">In Arbeit</Badge>;
    case "review":
      return <Badge variant="secondary">Feedback benötigt</Badge>;
    case "delivered":
      return <Badge variant="success">Bereit zur Abnahme</Badge>;
    case "archived":
      return <Badge variant="destructive">Archiviert</Badge>;
    default:
      return <Badge variant="outline">Unbekannt</Badge>;
  }
}
