import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/errors";

interface FileUploadCardProps {
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function FileUploadCard({ disabled = false, onUpload }: FileUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      await onUpload(file);
      toast.success("Datei erfolgreich hochgeladen.");
      event.target.value = "";
    } catch (error) {
      toast.error(getErrorMessage(error, "Datei konnte nicht hochgeladen werden."));
    } finally {
      setIsUploading(false);
    }
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
        <div className="rounded-2xl border border-dashed border-[#8F87F1]/30 bg-[linear-gradient(180deg,rgba(143,135,241,0.06)_0%,rgba(255,255,255,1)_55%)] p-5">
          <p className="text-sm font-medium text-slate-800">Datei hinzufügen</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Wähle eine Datei aus und lade sie direkt in dieses Projekt hoch.
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Erlaubte Formate: JPG, PNG, SVG, EPS, AI, DOCX, XLSX, MP4, MPEG
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button
            asChild
            className="bg-[#8F87F1] text-white hover:bg-[#7c74e2]"
            disabled={disabled || isUploading}
          >
            <label className="cursor-pointer">
            <Upload className="h-4 w-4" />
              {isUploading ? "Upload läuft..." : "Datei auswählen"}
              <input className="hidden" onChange={(event) => void handleChange(event)} type="file" />
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
