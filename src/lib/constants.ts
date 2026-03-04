import type { ProjectFileFolderKey, ProjectStatus, Role } from "@/types/app";

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

export const PROJECT_FILE_FOLDERS: Array<{ label: string; value: ProjectFileFolderKey }> = [
  { value: "briefing-inhalte", label: "Briefing & Inhalte" },
  { value: "medien-vom-kunden", label: "Medien vom Kunden" },
  { value: "entwuerfe", label: "Entwürfe" },
  { value: "final", label: "Final" },
];

export const LEGACY_PROJECT_FILE_GROUP = {
  label: "Weitere Dateien",
  value: "legacy",
} as const;

export const ALLOWED_UPLOAD_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "svg",
  "eps",
  "ai",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "mp4",
  "mpeg",
] as const;

export const UPLOAD_FILE_HINT = "Erlaubte Formate: JPG, PNG, SVG, EPS, AI, DOCX, XLSX, MP4, MPEG";

export const PAGE_SIZE = 10;
