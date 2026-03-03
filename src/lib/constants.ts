import type { ProjectStatus, Role } from "@/types/app";

export const APP_NAME = "abgelichtet Portal Enterprise";

export const STORAGE_BUCKET = "project-files";

export const LOCAL_STORAGE_KEYS = {
  impersonation: "abgelichtet.impersonation",
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  client: "Client",
};

export const PROJECT_STATUS_OPTIONS: Array<{
  description: string;
  label: string;
  value: ProjectStatus;
}> = [
  { value: "planned", label: "Planned", description: "Projekt ist angelegt, aber noch nicht gestartet." },
  { value: "active", label: "Active", description: "Projekt ist in Bearbeitung." },
  { value: "review", label: "Review", description: "Projekt ist in Freigabe oder Abstimmung." },
  { value: "delivered", label: "Delivered", description: "Projekt wurde ausgeliefert." },
  { value: "archived", label: "Archived", description: "Projekt ist archiviert." },
];

export const PAGE_SIZE = 10;
