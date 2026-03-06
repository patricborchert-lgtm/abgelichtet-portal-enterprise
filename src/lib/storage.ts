import { ALLOWED_UPLOAD_EXTENSIONS, LEGACY_PROJECT_FILE_GROUP, PROJECT_FILE_FOLDERS, LOCAL_STORAGE_KEYS } from "@/lib/constants";
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
  subfolder?: string,
): string {
  const sanitizedSubfolder = subfolder ? sanitizeFilename(subfolder).replace(/\./g, "-") : "";

  if (sanitizedSubfolder) {
    return `${clientId}/${projectId}/${folder}/${sanitizedSubfolder}/${Date.now()}-${sanitizeFilename(filename)}`;
  }

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

export function getProjectFileGroup(storagePath: string): ProjectFileFolderKey | typeof LEGACY_PROJECT_FILE_GROUP.value {
  const parts = storagePath.split("/");
  const folder = parts[2];

  return PROJECT_FILE_FOLDERS.some((entry) => entry.value === folder) ? (folder as ProjectFileFolderKey) : LEGACY_PROJECT_FILE_GROUP.value;
}

export function getProjectFileSubfolder(storagePath: string): string | null {
  const parts = storagePath.split("/");

  if (parts.length >= 5) {
    return parts[3] ?? null;
  }

  return null;
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
