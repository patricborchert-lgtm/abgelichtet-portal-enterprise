import type { Database, Json } from "@/types/database";

export type Role = Database["public"]["Tables"]["profiles"]["Row"]["role"];
export type ProjectStatus = Database["public"]["Tables"]["projects"]["Row"]["status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectFile = Database["public"]["Tables"]["project_files"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type TimelineEvent = Database["public"]["Tables"]["timeline_events"]["Row"];
export type Approval = Database["public"]["Tables"]["approvals"]["Row"];
export type ProjectMessage = Database["public"]["Tables"]["messages"]["Row"];
export type MilestoneStatus = Database["public"]["Tables"]["milestones"]["Row"]["status"];
export type TimelineEventType = Database["public"]["Tables"]["timeline_events"]["Row"]["event_type"];
export type ApprovalStatus = Database["public"]["Tables"]["approvals"]["Row"]["status"];
export type ProjectTemplateKey = "website" | "seo" | "photography";

export interface ClientFormValues {
  company: string;
  email: string;
  name: string;
  notes: string;
  phone: string;
}

export interface ProjectFormValues {
  clientId: string;
  description: string;
  templateKey?: ProjectTemplateKey | "";
  status: ProjectStatus;
  title: string;
}

export interface ActivityPayload {
  action: string;
  entityId?: string | null;
  entityType: string;
  metadata?: Json;
}

export interface MilestoneFormValues {
  description: string;
  sortOrder: number;
  title: string;
}

export interface TimelineEventFormValues {
  authorLabel: string;
  eventType: TimelineEventType;
  message: string;
}

export interface ApprovalDecisionValues {
  comment: string;
  status: Extract<ApprovalStatus, "approved" | "changes_requested">;
}

export interface MessageFormValues {
  authorLabel: string;
  body: string;
}

export interface ProjectTemplateOption {
  description: string;
  label: string;
  value: ProjectTemplateKey;
}

export interface InviteUserResponse {
  clientId: string;
  inviteLink: string;
}

export interface ImpersonationResponse {
  redirectUrl: string;
}

export interface AdminDashboardMetrics {
  activeClients: number;
  activeProjects: number;
  archivedProjects: number;
  files: number;
}

export interface ClientDashboardMetrics {
  activeProjects: number;
  deliveredProjects: number;
  pendingReview: number;
}

export interface WorkspaceDashboardMetrics {
  completedMilestones: number;
  pendingApprovals: number;
  recentMessages: number;
  timelineEntries: number;
}
