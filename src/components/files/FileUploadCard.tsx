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
    <Card>
      <CardHeader>
        <CardTitle>Datei-Upload</CardTitle>
        <CardDescription>Uploads sind standardmaessig nur fuer Admins freigeschaltet.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
        <Button asChild disabled={disabled || isUploading}>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4" />
            {isUploading ? "Upload laeuft..." : "Datei auswaehlen"}
            <input className="hidden" onChange={(event) => void handleChange(event)} type="file" />
          </label>
        </Button>
      </CardContent>
    </Card>
  );
}
