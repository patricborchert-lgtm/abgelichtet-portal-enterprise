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
      <div className="inline-flex min-w-full rounded-2xl border border-white/70 bg-white/90 p-1 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        {items.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <button
              key={item.key}
              className={cn(
                "flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-[linear-gradient(135deg,#8F87F1_0%,#A9A1FF_100%)] text-white shadow-[0_12px_26px_rgba(143,135,241,0.28)]"
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
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
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
