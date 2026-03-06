import {
  CheckCircle2,
  FileText,
  Flag,
  FolderPlus,
  FolderSync,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ActivityLog } from "@/types/app";

type Metadata = Record<string, unknown>;

export interface FormattedActivityEvent {
  description?: string;
  icon: LucideIcon;
  title: string;
}

function isMetadataObject(value: unknown): value is Metadata {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(meta: Metadata, key: string): string | undefined {
  const value = meta[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function getNumber(meta: Metadata, key: string): number | undefined {
  const value = meta[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function humanizeAction(action: string): string {
  const base = action.replace(/_/g, " ").trim();
  if (base.length === 0) {
    return "Aktivität";
  }

  return `${base.charAt(0).toUpperCase()}${base.slice(1)}`;
}

function buildDescription(event: ActivityLog, meta: Metadata): string | undefined {
  const direct =
    getString(meta, "title") ??
    getString(meta, "project_title") ??
    getString(meta, "client_name") ??
    getString(meta, "filename") ??
    getString(meta, "step_label");

  if (direct) {
    return direct;
  }

  if (event.action === "milestone_template_created") {
    const count = getNumber(meta, "milestone_count");
    if (typeof count === "number") {
      return `${count} Standard-Meilensteine angelegt`;
    }
  }

  if (event.entity_id) {
    return `${event.entity_type} · ${event.entity_id.slice(0, 8)}`;
  }

  return undefined;
}

export function formatActivityEvent(event: ActivityLog): FormattedActivityEvent {
  const metadata = isMetadataObject(event.metadata) ? event.metadata : {};
  const status = getString(metadata, "status");

  const mappings: Record<string, { icon: LucideIcon; title: string }> = {
    approval_decided: { icon: ShieldCheck, title: "Abnahme entschieden" },
    approval_requested: { icon: ShieldCheck, title: "Abnahme angefragt" },
    comment_added: { icon: MessageSquare, title: "Kommentar geschrieben" },
    file_deleted: { icon: FileText, title: "Datei gelöscht" },
    file_uploaded: { icon: FileText, title: "Datei hochgeladen" },
    impersonation_stopped: { icon: UserPlus, title: "Kundenansicht beendet" },
    invite_generated: { icon: UserPlus, title: "Einladungslink generiert" },
    message_created: { icon: MessageSquare, title: "Kommentar geschrieben" },
    milestone_completed: { icon: CheckCircle2, title: "Meilenstein abgeschlossen" },
    milestone_created: { icon: Flag, title: "Meilenstein hinzugefügt" },
    milestone_template_created: { icon: Flag, title: "Meilenstein-Vorlage erstellt" },
    milestone_updated: {
      icon: status === "completed" ? CheckCircle2 : Flag,
      title: status === "completed" ? "Meilenstein abgeschlossen" : "Meilenstein aktualisiert",
    },
    project_created: { icon: FolderPlus, title: "Projekt erstellt" },
    project_updated: { icon: FolderSync, title: "Projekt aktualisiert" },
    timeline_event_created: { icon: MessageSquare, title: "Timeline aktualisiert" },
  };

  const mapping = mappings[event.action];

  if (!mapping) {
    return {
      description: buildDescription(event, metadata),
      icon: MessageSquare,
      title: humanizeAction(event.action),
    };
  }

  return {
    description: buildDescription(event, metadata),
    icon: mapping.icon,
    title: mapping.title,
  };
}

export function formatRelativeActivityTime(dateInput: string, now = new Date()): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "vor wenigen Sekunden";
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `vor ${minutes} ${minutes === 1 ? "Minute" : "Minuten"}`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `vor ${hours} ${hours === 1 ? "Stunde" : "Stunden"}`;
  }

  if (diffMs < 2 * day) {
    return "gestern";
  }

  if (diffMs < 7 * day) {
    const days = Math.floor(diffMs / day);
    return `vor ${days} Tagen`;
  }

  if (diffMs < 30 * day) {
    const weeks = Math.floor(diffMs / (7 * day));
    return `vor ${weeks} ${weeks === 1 ? "Woche" : "Wochen"}`;
  }

  if (diffMs < 365 * day) {
    const months = Math.floor(diffMs / (30 * day));
    return `vor ${months} ${months === 1 ? "Monat" : "Monaten"}`;
  }

  const years = Math.floor(diffMs / (365 * day));
  return `vor ${years} ${years === 1 ? "Jahr" : "Jahren"}`;
}
