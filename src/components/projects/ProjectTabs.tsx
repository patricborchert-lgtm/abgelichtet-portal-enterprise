import { cn } from "@/lib/utils";

interface ProjectTabItem {
  key: string;
  label: string;
  badge?: number;
}

interface ProjectTabsProps {
  activeTab: string;
  items: ProjectTabItem[];
  onChange: (key: string) => void;
}

export function ProjectTabs({ activeTab, items, onChange }: ProjectTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-6 border-b border-slate-200 px-1">
        {items.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <button
              key={item.key}
              className={cn(
                "relative -mb-px inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors duration-200",
                isActive ? "border-violet-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900",
              )}
              onClick={() => onChange(item.key)}
              type="button"
            >
              <span>{item.label}</span>
              {typeof item.badge === "number" ? (
                <span
                  className={cn(
                    "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs",
                    isActive ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
