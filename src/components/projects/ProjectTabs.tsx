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
      <div className="inline-flex min-w-full rounded-xl border border-slate-200/70 bg-white/90 p-1.5 shadow-sm">
        {items.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <button
              key={item.key}
              className={cn(
                "flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
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
