import { useEffect, useMemo, useState } from "react";
import { FolderTree } from "lucide-react";
import { FileGrid } from "@/components/files/FileGrid";
import { FileUploadDropzone } from "@/components/files/FileUploadDropzone";
import { FolderList } from "@/components/files/FolderList";
import { getProjectFoldersForService, resolveProjectFolderId } from "@/lib/projectFileStructure";
import type { ProjectWithClient } from "@/api/projects";
import type { ProjectFile, ProjectFileFolderKey } from "@/types/app";

interface FileBrowserProps {
  files: ProjectFile[];
  isAdmin: boolean;
  onDeleteFile: (file: ProjectFile) => Promise<void>;
  onDownloadFile: (file: ProjectFile) => Promise<void>;
  onPreviewFile?: (file: ProjectFile) => Promise<void>;
  onUploadFile: (file: File, folder: ProjectFileFolderKey, subfolder?: string) => Promise<void>;
  project: ProjectWithClient;
}

export function FileBrowser({
  files,
  isAdmin,
  onDeleteFile,
  onDownloadFile,
  onPreviewFile,
  onUploadFile,
  project,
}: FileBrowserProps) {
  const folders = useMemo(() => getProjectFoldersForService(project.service_type), [project.service_type]);
  const [activeFolderId, setActiveFolderId] = useState(folders[0]?.id ?? "");

  useEffect(() => {
    setActiveFolderId(folders[0]?.id ?? "");
  }, [folders]);

  const filesWithFolder = useMemo(
    () =>
      files.map((file) => ({
        file,
        folderId: resolveProjectFolderId(file.storage_path, folders),
      })),
    [files, folders],
  );

  const activeFiles = useMemo(
    () => filesWithFolder.filter((entry) => entry.folderId === activeFolderId).map((entry) => entry.file),
    [activeFolderId, filesWithFolder],
  );

  const folderItems = useMemo(
    () =>
      folders.map((folder) => ({
        fileCount: filesWithFolder.filter((entry) => entry.folderId === folder.id).length,
        id: folder.id,
        label: folder.label,
      })),
    [filesWithFolder, folders],
  );

  const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? folders[0];

  async function handleFolderUpload(file: File) {
    if (!activeFolder) {
      return;
    }

    await onUploadFile(file, activeFolder.storageFolder, activeFolder.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FolderTree className="h-4 w-4 text-violet-600" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Projekt Ordner</p>
      </div>

      <FolderList activeFolderId={activeFolderId} folders={folderItems} onSelect={setActiveFolderId} />

      {isAdmin && activeFolder ? (
        <FileUploadDropzone folderLabel={activeFolder.label} onUploadFile={handleFolderUpload} />
      ) : null}

      <FileGrid
        files={activeFiles}
        isAdmin={isAdmin}
        onDelete={onDeleteFile}
        onDownload={onDownloadFile}
        onPreview={onPreviewFile ?? onDownloadFile}
      />
    </div>
  );
}
