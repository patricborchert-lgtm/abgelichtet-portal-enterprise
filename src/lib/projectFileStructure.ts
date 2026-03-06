import { getProjectFileGroup, getProjectFileSubfolder } from "@/lib/storage";
import type { ProjectFileFolderKey, ProjectServiceType } from "@/types/app";

export interface ProjectFolderDefinition {
  id: string;
  label: string;
  storageFolder: ProjectFileFolderKey;
}

export interface DefaultFileRequestTemplate {
  description: string;
  folderId: string;
  title: string;
}

type FolderMap = Record<ProjectServiceType | "default", ProjectFolderDefinition[]>;

const PROJECT_FOLDER_MAP: FolderMap = {
  branding: [
    { id: "briefing", label: "Briefing", storageFolder: "briefing-inhalte" },
    { id: "logo", label: "Logo", storageFolder: "entwuerfe" },
    { id: "designsystem", label: "Designsystem", storageFolder: "entwuerfe" },
    { id: "assets", label: "Assets", storageFolder: "medien-vom-kunden" },
    { id: "final", label: "Final", storageFolder: "final" },
  ],
  default: [
    { id: "briefing", label: "Briefing", storageFolder: "briefing-inhalte" },
    { id: "assets", label: "Assets", storageFolder: "medien-vom-kunden" },
    { id: "entwurf", label: "Entwurf", storageFolder: "entwuerfe" },
    { id: "final", label: "Final", storageFolder: "final" },
  ],
  fotografie: [
    { id: "briefing", label: "Briefing", storageFolder: "briefing-inhalte" },
    { id: "raw", label: "RAW", storageFolder: "medien-vom-kunden" },
    { id: "bearbeitung", label: "Bearbeitung", storageFolder: "entwuerfe" },
    { id: "final", label: "Final", storageFolder: "final" },
  ],
  marketing: [
    { id: "strategie", label: "Strategie", storageFolder: "briefing-inhalte" },
    { id: "kampagnen", label: "Kampagnen", storageFolder: "entwuerfe" },
    { id: "assets", label: "Assets", storageFolder: "medien-vom-kunden" },
    { id: "reports", label: "Reports", storageFolder: "final" },
  ],
  seo: [
    { id: "analyse", label: "Analyse", storageFolder: "briefing-inhalte" },
    { id: "keywords", label: "Keywords", storageFolder: "briefing-inhalte" },
    { id: "content", label: "Content", storageFolder: "medien-vom-kunden" },
    { id: "reports", label: "Reports", storageFolder: "final" },
  ],
  social_media: [
    { id: "strategie", label: "Strategie", storageFolder: "briefing-inhalte" },
    { id: "content", label: "Content", storageFolder: "medien-vom-kunden" },
    { id: "design", label: "Design", storageFolder: "entwuerfe" },
    { id: "reports", label: "Reports", storageFolder: "final" },
  ],
  video: [
    { id: "briefing", label: "Briefing", storageFolder: "briefing-inhalte" },
    { id: "footage", label: "Footage", storageFolder: "medien-vom-kunden" },
    { id: "schnitt", label: "Schnitt", storageFolder: "entwuerfe" },
    { id: "final", label: "Final", storageFolder: "final" },
  ],
  webdesign: [
    { id: "briefing", label: "Briefing", storageFolder: "briefing-inhalte" },
    { id: "design", label: "Design", storageFolder: "entwuerfe" },
    { id: "content", label: "Content", storageFolder: "medien-vom-kunden" },
    { id: "assets", label: "Assets", storageFolder: "medien-vom-kunden" },
    { id: "final", label: "Final", storageFolder: "final" },
  ],
};

const DEFAULT_REQUESTS: Record<ProjectServiceType | "default", DefaultFileRequestTemplate[]> = {
  branding: [
    { title: "Logo", description: "Vektordatei oder bisherige Logo-Version", folderId: "logo" },
    { title: "Brand Guidelines", description: "Vorhandene Markenrichtlinien", folderId: "designsystem" },
    { title: "Bilder", description: "Bildmaterial für Markenanwendungen", folderId: "assets" },
  ],
  default: [
    { title: "Logo", description: "Aktuelles Logo in hoher Auflösung", folderId: "assets" },
    { title: "Texte", description: "Relevante Inhalte und Copy", folderId: "briefing" },
    { title: "Dokumente", description: "Zusätzliche Unterlagen für das Projekt", folderId: "assets" },
  ],
  fotografie: [
    { title: "Shooting Briefing", description: "Ziele, Stil und Anforderungen", folderId: "briefing" },
    { title: "RAW Material", description: "Originaldateien vom Shooting", folderId: "raw" },
    { title: "Referenzbilder", description: "Mood und gewünschter Look", folderId: "bearbeitung" },
  ],
  marketing: [
    { title: "Kampagnenziel", description: "Ziele, Zielgruppe und KPIs", folderId: "strategie" },
    { title: "Brand Assets", description: "Logo, Farben und Fonts", folderId: "assets" },
    { title: "Report Vorlage", description: "Gewünschte Reporting-Struktur", folderId: "reports" },
  ],
  seo: [
    { title: "Zielseiten", description: "Wichtige URLs und Prioritäten", folderId: "analyse" },
    { title: "Keyword-Liste", description: "Bestehende Keywords und Themen", folderId: "keywords" },
    { title: "Content Inputs", description: "Texte, FAQs und Produktinfos", folderId: "content" },
  ],
  social_media: [
    { title: "Kanalzugänge", description: "Benötigte Plattform-Accounts", folderId: "strategie" },
    { title: "Content Assets", description: "Bilder und Video-Snippets", folderId: "content" },
    { title: "Design Dateien", description: "Vorlagen und CI-Elemente", folderId: "design" },
  ],
  video: [
    { title: "Video Briefing", description: "Kernaussage und Storyline", folderId: "briefing" },
    { title: "Footage", description: "Rohmaterial, Clips und Audio", folderId: "footage" },
    { title: "Abnahmekommentar", description: "Feedback zur Schnittfassung", folderId: "schnitt" },
  ],
  webdesign: [
    { title: "Logo", description: "Logo als SVG/PNG/PDF", folderId: "assets" },
    { title: "Website Texte", description: "Texte für alle zentralen Seiten", folderId: "content" },
    { title: "Bilder", description: "Bildmaterial für Hero und Sektionen", folderId: "assets" },
    { title: "Brand Guidelines", description: "Farben, Fonts, Tonalität", folderId: "design" },
    { title: "Dokumente", description: "Zusätzliche Unterlagen/Briefing", folderId: "briefing" },
  ],
};

export function getProjectFoldersForService(serviceType: ProjectServiceType | null | undefined): ProjectFolderDefinition[] {
  if (!serviceType) {
    return PROJECT_FOLDER_MAP.default;
  }

  return PROJECT_FOLDER_MAP[serviceType] ?? PROJECT_FOLDER_MAP.default;
}

export function resolveProjectFolderId(storagePath: string, folders: ProjectFolderDefinition[]): string {
  const subfolder = getProjectFileSubfolder(storagePath);

  if (subfolder && folders.some((folder) => folder.id === subfolder)) {
    return subfolder;
  }

  const storageGroup = getProjectFileGroup(storagePath);
  const match = folders.find((folder) => folder.storageFolder === storageGroup);

  return match?.id ?? folders[0]?.id ?? "unknown";
}

export function getDefaultFileRequests(serviceType: ProjectServiceType | null | undefined): DefaultFileRequestTemplate[] {
  if (!serviceType) {
    return DEFAULT_REQUESTS.default;
  }

  return DEFAULT_REQUESTS[serviceType] ?? DEFAULT_REQUESTS.default;
}
