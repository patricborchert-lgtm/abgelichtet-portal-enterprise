import type { Database, Json } from "@/types/database";

export type Role = Database["public"]["Tables"]["profiles"]["Row"]["role"];
export type ProjectStatus = Database["public"]["Tables"]["projects"]["Row"]["status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectFile = Database["public"]["Tables"]["project_files"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];

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
  status: ProjectStatus;
  title: string;
}

export interface ActivityPayload {
  action: string;
  entityId?: string | null;
  entityType: string;
  metadata?: Json;
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
