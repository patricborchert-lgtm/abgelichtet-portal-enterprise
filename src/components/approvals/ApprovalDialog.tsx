import { useEffect, useState } from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalDialogProps {
  cancelLabel?: string;
  description?: string;
  initialValue?: string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => Promise<void>;
  open: boolean;
  placeholder?: string;
  requireMessage?: boolean;
  submitLabel?: string;
  title: string;
}

export function ApprovalDialog({
  cancelLabel = "Abbrechen",
  description,
  initialValue = "",
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
  placeholder = "Beschreibe die gewünschten Änderungen...",
  requireMessage = true,
  submitLabel = "Senden",
  title,
}: ApprovalDialogProps) {
  const [message, setMessage] = useState(initialValue);

  useEffect(() => {
    if (open) {
      setMessage(initialValue);
    }
  }, [initialValue, open]);

  async function handleSubmit() {
    const trimmedMessage = message.trim();

    if (requireMessage && trimmedMessage.length === 0) {
      return;
    }

    await onSubmit(trimmedMessage);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg rounded-2xl border border-slate-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            autoFocus
            className="min-h-28"
            onChange={(event) => setMessage(event.target.value)}
            placeholder={placeholder}
            value={message}
          />
        </div>

        <DialogFooter>
          <PremiumButton disabled={isSubmitting} onClick={() => onOpenChange(false)} type="button" variant="secondary">
            {cancelLabel}
          </PremiumButton>
          <PremiumButton
            disabled={isSubmitting || (requireMessage && message.trim().length === 0)}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {isSubmitting ? "Wird gesendet..." : submitLabel}
          </PremiumButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
