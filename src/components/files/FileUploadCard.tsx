import { useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
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
    <Card
      className="overflow-hidden border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      style={{ borderRadius: 16 }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
      />
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
            "rounded-2xl border border-dashed p-5 transition-colors",
            isDragActive
              ? "border-[#8F87F1] bg-[linear-gradient(180deg,rgba(143,135,241,0.12)_0%,rgba(255,255,255,1)_55%)]"
              : "border-[#8F87F1]/30 bg-[linear-gradient(180deg,rgba(143,135,241,0.06)_0%,rgba(255,255,255,1)_55%)]",
          )}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(event) => void handleDrop(event)}
        >
          <p className="text-sm font-medium text-slate-800">Datei hinzufügen</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Wähle einen Ordner aus oder ziehe deine Datei direkt in diesen Bereich.
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            {UPLOAD_FILE_HINT}
          </p>
          {isDragActive ? <p className="mt-3 text-sm font-medium text-[#6E65D8]">Datei hier ablegen, um den Upload zu starten.</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Dateiordner</Label>
          <Select onValueChange={(value) => setFolder(value as ProjectFileFolderKey)} value={folder}>
            <SelectTrigger className="border-slate-200 bg-slate-50/70">
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
          <Button
            asChild
            className="bg-[#8F87F1] text-white hover:bg-[#7c74e2]"
            disabled={disabled || isUploading}
          >
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
