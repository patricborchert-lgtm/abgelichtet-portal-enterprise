import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { CheckCircle, Flag, MessageSquare, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectQuickActionsProps {
  onAddComment: () => void;
  onCreateMilestone: () => void;
  onSendApproval: () => void;
  onUploadFile: () => void;
}

interface QuickActionItem {
  icon: ComponentType<{ className?: string }>;
  id: "upload" | "comment" | "milestone" | "approval";
  label: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { icon: Upload, id: "upload", label: "Upload Datei" },
  { icon: MessageSquare, id: "comment", label: "Kommentar hinzufügen" },
  { icon: Flag, id: "milestone", label: "Meilenstein erstellen" },
  { icon: CheckCircle, id: "approval", label: "Freigabe senden" },
];

export function ProjectQuickActions({
  onAddComment,
  onCreateMilestone,
  onSendApproval,
  onUploadFile,
}: ProjectQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleActionClick(actionId: QuickActionItem["id"]) {
    setOpen(false);

    if (actionId === "upload") {
      onUploadFile();
      return;
    }

    if (actionId === "comment") {
      onAddComment();
      return;
    }

    if (actionId === "milestone") {
      onCreateMilestone();
      return;
    }

    onSendApproval();
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-violet-700"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        + Aktion
      </button>

      <div
        className={cn(
          "absolute right-0 top-12 z-50 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-lg transition-all duration-200",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
        role="menu"
      >
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50"
              key={item.id}
              onClick={() => handleActionClick(item.id)}
              role="menuitem"
              type="button"
            >
              <Icon className="h-4 w-4 text-slate-500" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
