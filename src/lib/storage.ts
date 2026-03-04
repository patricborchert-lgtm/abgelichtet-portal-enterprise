import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

import { ALLOWED_UPLOAD_EXTENSIONS } from "@/lib/constants";
import type { ProjectFileFolderKey } from "@/types/app";

export interface StoredImpersonationSession {
  adminAccessToken: string;
  adminRefreshToken: string;
  adminUserId: string;
  clientId: string;
  clientName: string;
  returnPath: string;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export function buildStoragePath(
  clientId: string,
  projectId: string,
  folder: ProjectFileFolderKey,
  filename: string,
): string {
  return `${clientId}/${projectId}/${folder}/${Date.now()}-${sanitizeFilename(filename)}`;
}

export function getFileExtension(filename: string): string {
  const extension = filename.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

export function isAllowedUploadFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ALLOWED_UPLOAD_EXTENSIONS.includes(extension as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number]);
}

export function persistImpersonationSession(payload: StoredImpersonationSession): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.impersonation, JSON.stringify(payload));
}

export function readImpersonationSession(): StoredImpersonationSession | null {
  const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEYS.impersonation);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredImpersonationSession;
  } catch {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.impersonation);
    return null;
  }
}

export function clearImpersonationSession(): void {
  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.impersonation);
}
