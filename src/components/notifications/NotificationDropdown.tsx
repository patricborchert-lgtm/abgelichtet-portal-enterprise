import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/types/app";

interface NotificationDropdownProps {
  isLoading: boolean;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NOTIFICATION_TYPE_LABELS: Record<Notification["type"], string> = {
  approval_requested: "Abnahme",
  approved: "Abgenommen",
  changes_requested: "Änderungen",
  chat_message: "Chat",
  file_uploaded: "Datei",
};

export function NotificationDropdown({ isLoading, notifications, onNotificationClick }: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-12 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.12)]">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Benachrichtigungen</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Lädt...
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">Keine Benachrichtigungen vorhanden.</div>
      ) : (
        <div className="max-h-96 overflow-y-auto p-2">
          {notifications.map((notification) => (
            <button
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                notification.is_read
                  ? "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  : "border-[#8F87F1]/25 bg-[#8F87F1]/5 hover:bg-[#8F87F1]/10"
              }`}
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6E65D8]">
                  {NOTIFICATION_TYPE_LABELS[notification.type]}
                </p>
                <p className="text-xs text-slate-400">{formatDate(notification.created_at)}</p>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-900">{notification.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.message}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
