import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBellProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount: number;
}

export function NotificationBell({ isOpen, onClick, unreadCount }: NotificationBellProps) {
  return (
    <Button
      aria-expanded={isOpen}
      aria-label="Benachrichtigungen"
      className="relative border-slate-200 bg-white hover:bg-slate-50"
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <Bell className="h-4 w-4 text-[#6E65D8]" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#8F87F1] px-1.5 text-[10px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Button>
  );
}
