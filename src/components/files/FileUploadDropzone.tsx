import { useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { isAllowedUploadFile } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface FileUploadDropzoneProps {
  disabled?: boolean;
  folderLabel: string;
  onUploadFile: (file: File) => Promise<void>;
}

export function FileUploadDropzone({ disabled = false, folderLabel, onUploadFile }: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");

  async function processUpload(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      for (const [index, file] of files.entries()) {
        setProgressLabel(`${index + 1} / ${files.length}`);

        if (!isAllowedUploadFile(file.name)) {
          toast.error(`\"${file.name}\" ist kein erlaubtes Dateiformat.`);
          continue;
        }

        try {
          await onUploadFile(file);
        } catch (error) {
          toast.error(getErrorMessage(error, `\"${file.name}\" konnte nicht hochgeladen werden.`));
        }
      }

      toast.success(files.length === 1 ? "Datei hochgeladen." : `${files.length} Dateien hochgeladen.`);
    } finally {
      setIsUploading(false);
      setProgressLabel("");
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    await processUpload(files);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (disabled || isUploading) {
      return;
    }

    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragActive(false);
    }
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);

    if (disabled || isUploading) {
      return;
    }

    await processUpload(Array.from(event.dataTransfer.files ?? []));
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-6 text-center transition-colors",
        isDragActive ? "border-violet-400 bg-violet-50/60" : "border-slate-300 bg-slate-50/60",
      )}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={(event) => void handleDrop(event)}
    >
      <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm">
        <UploadCloud className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-900">Dateien für „{folderLabel}“ ablegen</p>
      <p className="mt-1 text-sm text-slate-500">Drag & Drop oder über Datei-Auswahl hochladen.</p>
      {isUploading ? <p className="mt-2 text-xs font-medium text-violet-700">Upload läuft ({progressLabel})</p> : null}

      <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700">
        Dateien auswählen
        <input
          className="hidden"
          disabled={disabled || isUploading}
          multiple
          onChange={(event) => void handleFileChange(event)}
          type="file"
        />
      </label>
    </div>
  );
}
