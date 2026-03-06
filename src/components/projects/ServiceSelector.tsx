import { cn } from "@/lib/utils";
import type { ProjectTemplate, ProjectTemplateId } from "@/lib/projectTemplates";

interface ServiceSelectorProps {
  disabled?: boolean;
  onSelect: (id: ProjectTemplateId) => void;
  selectedId: ProjectTemplateId;
  services: ProjectTemplate[];
}

export function ServiceSelector({ disabled = false, onSelect, selectedId, services }: ServiceSelectorProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {services.map((service) => {
        const isActive = selectedId === service.id;

        return (
          <button
            aria-pressed={isActive}
            disabled={disabled}
            className={cn(
              "rounded-xl border p-2.5 text-left transition-all duration-200",
              isActive
                ? "border-violet-300 bg-violet-50/70 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              disabled ? "cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-white" : "",
            )}
            key={service.id}
            onClick={() => onSelect(service.id)}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold",
                  isActive ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600",
                )}
              >
                {service.iconLabel}
              </span>
              <p className="text-sm font-semibold text-slate-900">{service.label}</p>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{service.description}</p>
          </button>
        );
      })}
    </div>
  );
}
