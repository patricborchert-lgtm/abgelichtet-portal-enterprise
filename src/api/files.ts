import { supabase } from "@/integrations/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import { assertSuccess } from "@/lib/errors";
import { buildStoragePath } from "@/lib/storage";
import type { ProjectFile, ProjectFileFolderKey } from "@/types/app";

export interface SearchProjectFile {
  created_at: string;
  filename: string;
  id: string;
  project_id: string;
  projects: { title: string } | null;
}

export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const result = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return assertSuccess(result, "Dateien konnten nicht geladen werden.");
}

export async function uploadProjectFile(options: {
  clientId: string;
  file: File;
  folder: ProjectFileFolderKey;
  projectId: string;
  subfolder?: string;
  userId: string;
}): Promise<ProjectFile> {
  const storagePath = buildStoragePath(options.clientId, options.projectId, options.folder, options.file.name, options.subfolder);

  const uploadResult = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, options.file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message);
  }

  const insertResult = await supabase
    .from("project_files")
    .insert({
      filename: options.file.name,
      mime_type: options.file.type || null,
      project_id: options.projectId,
      size: options.file.size,
      storage_path: storagePath,
      uploaded_by: options.userId,
    })
    .select("*")
    .single();

  try {
    return assertSuccess(insertResult, "Dateimetadaten konnten nicht gespeichert werden.");
  } catch (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    throw error;
  }
}

export async function deleteProjectFile(file: ProjectFile): Promise<void> {
  const storageResult = await supabase.storage.from(STORAGE_BUCKET).remove([file.storage_path]);
  if (storageResult.error) {
    throw new Error(storageResult.error.message);
  }

  const deleteResult = await supabase.from("project_files").delete().eq("id", file.id);
  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }
}

export async function getProjectFileDownloadUrl(file: ProjectFile): Promise<string> {
  const result = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(file.storage_path, 60);
  const data = assertSuccess(result, "Download-Link konnte nicht erstellt werden.");
  return data.signedUrl;
}

export async function listRecentProjectFilesForSearch(limit = 60): Promise<SearchProjectFile[]> {
  const result = await supabase
    .from("project_files")
    .select("id, filename, created_at, project_id, projects(title)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return assertSuccess(result, "Dateien konnten nicht geladen werden.") as unknown as SearchProjectFile[];
}
