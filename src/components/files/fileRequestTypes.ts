export type FileRequestStatus = "pending" | "uploaded" | "approved" | "rejected";

export interface ProjectFileRequest {
  createdAt: string;
  description: string;
  folderId: string;
  id: string;
  status: FileRequestStatus;
  title: string;
  uploadedAt?: string | null;
}
