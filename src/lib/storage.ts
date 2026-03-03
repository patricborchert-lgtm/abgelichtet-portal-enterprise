import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

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

export function buildStoragePath(clientId: string, projectId: string, filename: string): string {
  return `${clientId}/${projectId}/${Date.now()}-${sanitizeFilename(filename)}`;
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
