import { useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { isAllowedUploadFile } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface ClientUploadDropzoneProps {
  disabled?: boolean;
  onUploadFile: (file: File) => Promise<void>;
}

export function ClientUploadDropzone({ disabled = false, onUploadFile }: ClientUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState("");

  async function processUpload(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      for (const [index, file] of files.entries()) {
        setProgress(`${index + 1} / ${files.length}`);

        if (!isAllowedUploadFile(file.name)) {
          toast.error(`\"${file.name}\" ist kein erlaubtes Dateiformat.`);
          continue;
        }

        try {
          await onUploadFile(file);
        } catch (error) {
          toast.error(getErrorMessage(error, "Datei konnte nicht hochgeladen werden."));
        }
      }
    } finally {
      setIsUploading(false);
      setProgress("");
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
        "rounded-xl border border-dashed p-4 text-center transition-colors",
        isDragActive ? "border-violet-400 bg-violet-50/60" : "border-slate-300 bg-slate-50/70",
      )}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={(event) => void handleDrop(event)}
    >
      <div className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm">
        <UploadCloud className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-slate-900">Dateien für diese Anfrage hochladen</p>
      <p className="mt-1 text-xs text-slate-500">Drag & Drop oder Auswahl über Button.</p>
      {isUploading ? <p className="mt-2 text-xs font-medium text-violet-700">Upload läuft ({progress})</p> : null}

      <label className="mt-3 inline-flex cursor-pointer items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
        Datei auswählen
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
