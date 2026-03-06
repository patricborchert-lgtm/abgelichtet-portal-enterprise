import { formatActivityEvent, formatRelativeActivityTime } from "@/lib/activityEventFormatter";
import type { ActivityLog } from "@/types/app";

interface ActivityItemProps {
  event: ActivityLog;
}

export function ActivityItem({ event }: ActivityItemProps) {
  const formatted = formatActivityEvent(event);
  const Icon = formatted.icon;

  return (
    <div className="flex gap-3 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-slate-900">{formatted.title}</p>
          <p className="shrink-0 text-xs text-slate-400">{formatRelativeActivityTime(event.created_at)}</p>
        </div>
        {formatted.description ? <p className="mt-1 text-sm text-slate-500">{formatted.description}</p> : null}
      </div>
    </div>
  );
}
