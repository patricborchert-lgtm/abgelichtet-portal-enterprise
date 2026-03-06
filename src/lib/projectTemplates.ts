import type { ProjectServiceType } from "@/types/app";

export type ProjectTemplateId = ProjectServiceType;

export interface ProjectTemplate {
  id: ProjectTemplateId;
  label: string;
  description: string;
  placeholderTitle: string;
  iconLabel: string;
  defaultMilestones: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "webdesign",
    label: "Webdesign",
    description: "Konzept, Design und Umsetzung moderner Webseiten.",
    placeholderTitle: "Neue Website für Kunde",
    iconLabel: "WD",
    defaultMilestones: [
      "Briefing erhalten",
      "Struktur & Konzept",
      "Design-Entwurf",
      "Umsetzung",
      "Inhalte einpflegen",
      "Abnahme",
      "Livegang",
    ],
  },
  {
    id: "seo",
    label: "SEO",
    description: "Sichtbarkeit steigern mit strukturierter Suchmaschinenoptimierung.",
    placeholderTitle: "SEO Optimierung Q2",
    iconLabel: "SEO",
    defaultMilestones: [
      "Analyse",
      "Keyword-Strategie",
      "OnPage Optimierung",
      "Content",
      "Monitoring",
      "Reporting",
    ],
  },
  {
    id: "fotografie",
    label: "Fotografie",
    description: "Von Shooting bis finaler Bildlieferung.",
    placeholderTitle: "Fotoshooting Kampagne",
    iconLabel: "FOTO",
    defaultMilestones: [
      "Briefing",
      "Shooting",
      "Vorauswahl",
      "Bildbearbeitung",
      "Abnahme",
      "Lieferung",
    ],
  },
  {
    id: "branding",
    label: "Branding",
    description: "Marke strategisch entwickeln und visuell schärfen.",
    placeholderTitle: "Brand Refresh 2026",
    iconLabel: "BR",
    defaultMilestones: [
      "Briefing",
      "Markenanalyse",
      "Positionierung",
      "Logo & Designsystem",
      "Anwendung",
      "Abnahme",
      "Übergabe",
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Kampagnen planen, ausrollen und optimieren.",
    placeholderTitle: "Marketing Kampagne Sommer",
    iconLabel: "MKT",
    defaultMilestones: [
      "Briefing",
      "Zielgruppenanalyse",
      "Strategie",
      "Kampagnenplanung",
      "Umsetzung",
      "Optimierung",
      "Reporting",
    ],
  },
  {
    id: "social_media",
    label: "Social Media",
    description: "Kanäle strukturieren, Content produzieren, Ergebnisse auswerten.",
    placeholderTitle: "Social Media Betreuung",
    iconLabel: "SM",
    defaultMilestones: [
      "Briefing",
      "Kanalstrategie",
      "Content Planung",
      "Designvorlagen",
      "Content Produktion",
      "Publishing",
      "Analyse",
    ],
  },
  {
    id: "video",
    label: "Video",
    description: "Videoprojekte von Konzept bis Finalisierung.",
    placeholderTitle: "Video Produktion Launch",
    iconLabel: "VID",
    defaultMilestones: [
      "Briefing",
      "Konzept",
      "Drehplanung",
      "Produktion",
      "Schnitt",
      "Feedback",
      "Finalisierung",
    ],
  },
];

export function getProjectTemplateById(id: ProjectTemplateId): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((template) => template.id === id);
}
