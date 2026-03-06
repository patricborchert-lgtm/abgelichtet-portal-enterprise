import { FolderClosed } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderItem {
  fileCount: number;
  id: string;
  label: string;
}

interface FolderListProps {
  activeFolderId: string;
  folders: FolderItem[];
  onSelect: (folderId: string) => void;
}

export function FolderList({ activeFolderId, folders, onSelect }: FolderListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => {
        const isActive = folder.id === activeFolderId;

        return (
          <button
            className={cn(
              "rounded-xl border p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md",
              isActive
                ? "border-violet-300 bg-violet-50/60"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80",
            )}
            key={folder.id}
            onClick={() => onSelect(folder.id)}
            type="button"
          >
            <div className="flex items-center gap-3">
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", isActive ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500")}>
                <FolderClosed className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{folder.label}</p>
                <p className="text-xs text-slate-500">{folder.fileCount} Datei{folder.fileCount === 1 ? "" : "en"}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
