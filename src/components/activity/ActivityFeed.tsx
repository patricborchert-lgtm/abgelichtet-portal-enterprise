import { ActivityItem } from "@/components/activity/ActivityItem";
import { EmptyState } from "@/components/common/EmptyState";
import type { ActivityLog } from "@/types/app";

interface ActivityFeedProps {
  emptyDescription?: string;
  emptyTitle?: string;
  events: ActivityLog[];
}

export function ActivityFeed({
  emptyDescription = "Noch keine Aktivitäten vorhanden.",
  emptyTitle = "Keine Aktivitäten",
  events,
}: ActivityFeedProps) {
  if (events.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <ActivityItem event={event} key={event.id} />
      ))}
    </div>
  );
}
