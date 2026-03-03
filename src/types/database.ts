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
      projects: {
        Row: {
          client_id: string;
          created_at: string;
          description: string | null;
          id: string;
          status: "planned" | "active" | "review" | "delivered" | "archived";
          title: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          status: "planned" | "active" | "review" | "delivered" | "archived";
          title: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          status?: "planned" | "active" | "review" | "delivered" | "archived";
          title?: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      my_client_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
  };
}
