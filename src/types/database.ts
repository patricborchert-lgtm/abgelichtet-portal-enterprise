export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string;
          actor_id: string | null;
          actor_role: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          actor_role?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          actor_role?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
        };
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          ip_address: string | null;
          metadata: Json;
          severity: "info" | "warning" | "critical";
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          severity?: "info" | "warning" | "critical";
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          severity?: "info" | "warning" | "critical";
        };
      };
      approvals: {
        Row: {
          created_at: string;
          decided_at: string | null;
          id: string;
          project_id: string;
          request_message: string | null;
          requested_by: string | null;
          response_comment: string | null;
          reviewed_by: string | null;
          step_key: "design_proposal" | "revision_round" | "pre_go_live" | "final_project";
          step_label: string | null;
          step_round: number;
          status: "pending" | "approved" | "changes_requested";
        };
        Insert: {
          created_at?: string;
          decided_at?: string | null;
          id?: string;
          project_id: string;
          request_message?: string | null;
          requested_by?: string | null;
          response_comment?: string | null;
          reviewed_by?: string | null;
          step_key?: "design_proposal" | "revision_round" | "pre_go_live" | "final_project";
          step_label?: string | null;
          step_round?: number;
          status?: "pending" | "approved" | "changes_requested";
        };
        Update: {
          created_at?: string;
          decided_at?: string | null;
          id?: string;
          project_id?: string;
          request_message?: string | null;
          requested_by?: string | null;
          response_comment?: string | null;
          reviewed_by?: string | null;
          step_key?: "design_proposal" | "revision_round" | "pre_go_live" | "final_project";
          step_label?: string | null;
          step_round?: number;
          status?: "pending" | "approved" | "changes_requested";
        };
      };
      clients: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          name: string;
          notes: string | null;
          phone: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          is_active?: boolean;
          name: string;
          notes?: string | null;
          phone?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          notes?: string | null;
          phone?: string | null;
        };
      };
      profiles: {
        Row: {
          client_id: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          role: "admin" | "client";
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          id: string;
          is_active?: boolean;
          role: "admin" | "client";
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role?: "admin" | "client";
        };
      };
      project_files: {
        Row: {
          created_at: string;
          filename: string;
          id: string;
          mime_type: string | null;
          project_id: string;
          size: number | null;
          storage_path: string;
          uploaded_by: string | null;
        };
        Insert: {
          created_at?: string;
          filename: string;
          id?: string;
          mime_type?: string | null;
          project_id: string;
          size?: number | null;
          storage_path: string;
          uploaded_by?: string | null;
        };
        Update: {
          created_at?: string;
          filename?: string;
          id?: string;
          mime_type?: string | null;
          project_id?: string;
          size?: number | null;
          storage_path?: string;
          uploaded_by?: string | null;
        };
      };
      milestones: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          project_id: string;
          sort_order: number;
          status: "pending" | "in_progress" | "completed";
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          project_id: string;
          sort_order?: number;
          status?: "pending" | "in_progress" | "completed";
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          project_id?: string;
          sort_order?: number;
          status?: "pending" | "in_progress" | "completed";
          title?: string;
        };
      };
      messages: {
        Row: {
          author_id: string | null;
          author_label: string;
          body: string;
          created_at: string;
          id: string;
          project_id: string;
        };
        Insert: {
          author_id?: string | null;
          author_label: string;
          body: string;
          created_at?: string;
          id?: string;
          project_id: string;
        };
        Update: {
          author_id?: string | null;
          author_label?: string;
          body?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
        };
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          message: string;
          project_id: string;
          title: string;
          type: "chat_message" | "file_uploaded" | "approval_requested" | "approved" | "changes_requested";
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message: string;
          project_id: string;
          title: string;
          type: "chat_message" | "file_uploaded" | "approval_requested" | "approved" | "changes_requested";
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          project_id?: string;
          title?: string;
          type?: "chat_message" | "file_uploaded" | "approval_requested" | "approved" | "changes_requested";
          user_id?: string;
        };
      };
      projects: {
        Row: {
          client_id: string;
          created_at: string;
          description: string | null;
          id: string;
          service_type:
            | "webdesign"
            | "seo"
            | "fotografie"
            | "branding"
            | "marketing"
            | "social_media"
            | "video"
            | null;
          status: "planned" | "active" | "review" | "delivered" | "archived";
          title: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          service_type?:
            | "webdesign"
            | "seo"
            | "fotografie"
            | "branding"
            | "marketing"
            | "social_media"
            | "video"
            | null;
          status: "planned" | "active" | "review" | "delivered" | "archived";
          title: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          service_type?:
            | "webdesign"
            | "seo"
            | "fotografie"
            | "branding"
            | "marketing"
            | "social_media"
            | "video"
            | null;
          status?: "planned" | "active" | "review" | "delivered" | "archived";
          title?: string;
        };
      };
      timeline_events: {
        Row: {
          author_id: string | null;
          author_label: string;
          created_at: string;
          event_type: "comment" | "update" | "approval_requested" | "approved" | "changes_requested" | "milestone";
          id: string;
          message: string;
          metadata: Json;
          project_id: string;
        };
        Insert: {
          author_id?: string | null;
          author_label: string;
          created_at?: string;
          event_type: "comment" | "update" | "approval_requested" | "approved" | "changes_requested" | "milestone";
          id?: string;
          message: string;
          metadata?: Json;
          project_id: string;
        };
        Update: {
          author_id?: string | null;
          author_label?: string;
          created_at?: string;
          event_type?: "comment" | "update" | "approval_requested" | "approved" | "changes_requested" | "milestone";
          id?: string;
          message?: string;
          metadata?: Json;
          project_id?: string;
        };
      };
    };
    Functions: {
      create_project_notification: {
        Args: {
          p_message: string;
          p_project_id: string;
          p_title: string;
          p_type: "chat_message" | "file_uploaded" | "approval_requested" | "approved" | "changes_requested";
        };
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      my_client_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      respond_to_project_approval: {
        Args: {
          p_approval_id: string;
          p_response_comment?: string | null;
          p_status: "approved" | "changes_requested";
        };
        Returns: undefined;
      };
    };
  };
}
