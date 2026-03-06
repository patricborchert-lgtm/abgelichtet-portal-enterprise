import { useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";
import { Upload, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_FILE_FOLDERS, UPLOAD_FILE_HINT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors";
import { isAllowedUploadFile } from "@/lib/storage";
import type { ProjectFileFolderKey } from "@/types/app";

interface FileUploadCardProps {
  disabled?: boolean;
  onUpload: (file: File, folder: ProjectFileFolderKey) => Promise<void>;
}

export function FileUploadCard({ disabled = false, onUpload }: FileUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [folder, setFolder] = useState<ProjectFileFolderKey>("briefing-inhalte");

  async function processUpload(files: File[], onDone?: () => void) {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      let uploadedCount = 0;
      let failedCount = 0;

      for (const file of files) {
        if (!isAllowedUploadFile(file.name)) {
          failedCount += 1;
          toast.error(`"${file.name}" ist kein erlaubtes Dateiformat.`);
          continue;
        }

        try {
          await onUpload(file, folder);
          uploadedCount += 1;
        } catch (error) {
          failedCount += 1;
          toast.error(getErrorMessage(error, `„${file.name}“ konnte nicht hochgeladen werden.`));
        }
      }

      if (uploadedCount > 0 && failedCount === 0) {
        toast.success(uploadedCount === 1 ? "Datei erfolgreich hochgeladen." : `${uploadedCount} Dateien erfolgreich hochgeladen.`);
      } else if (uploadedCount > 0 && failedCount > 0) {
        toast.warning(`${uploadedCount} Dateien hochgeladen, ${failedCount} fehlgeschlagen.`);
      }

      onDone?.();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    await processUpload(files, () => {
      event.target.value = "";
    });
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

    const files = Array.from(event.dataTransfer.files ?? []);
    await processUpload(files);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Dateien</p>
        <CardTitle className="text-2xl text-slate-950">Datei-Upload</CardTitle>
        <CardDescription className="max-w-2xl leading-6">
          Lade Dateien für dieses Projekt hoch. Uploads sind standardmässig nur für Admins freigeschaltet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex h-40 flex-col items-center justify-center rounded-xl border border-dashed px-5 text-center transition-colors",
            isDragActive
              ? "border-violet-400/80 bg-violet-50/60"
              : "border-violet-300/70 bg-violet-50/35",
          )}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(event) => void handleDrop(event)}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-600">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Dateien hier ablegen oder durchsuchen</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
            Wähle zuerst den Ordner und ziehe dann Dateien in den Bereich oder nutze die Auswahl.
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            {UPLOAD_FILE_HINT}
          </p>
          {isDragActive ? <p className="mt-2 text-sm font-medium text-violet-700">Datei hier ablegen, um den Upload zu starten.</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Dateiordner</Label>
          <Select onValueChange={(value) => setFolder(value as ProjectFileFolderKey)} value={folder}>
            <SelectTrigger>
              <SelectValue placeholder="Ordner wählen" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_FILE_FOLDERS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button asChild disabled={disabled || isUploading}>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" />
              {isUploading ? "Upload läuft..." : "Dateien auswählen"}
              <input className="hidden" multiple onChange={(event) => void handleChange(event)} type="file" />
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
