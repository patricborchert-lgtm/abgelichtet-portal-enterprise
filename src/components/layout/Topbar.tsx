import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUnreadNotificationCount, listNotifications, markNotificationRead } from "@/api/notifications";
import { QuickCreateMenu } from "@/components/layout/QuickCreateMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import type { Notification } from "@/types/app";

export function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, signOut, user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRootRef = useRef<HTMLDivElement | null>(null);

  const notificationsQuery = useQuery({
    enabled: Boolean(user),
    queryFn: () => listNotifications(12),
    queryKey: ["notifications", "topbar"],
    refetchInterval: 10000,
  });

  const unreadCountQuery = useQuery({
    enabled: Boolean(user),
    queryFn: getUnreadNotificationCount,
    queryKey: ["notifications", "unread-count"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notificationRootRef.current) {
        return;
      }

      if (!notificationRootRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      toast.success("Du wurdest ausgeloggt.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Abmelden fehlgeschlagen."));
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        // Notification read-state must never block navigation.
      }
    }

    setIsNotificationOpen(false);
    navigate(profile?.role === "admin" ? `/admin/projects/${notification.project_id}` : `/project/${notification.project_id}`);
  }

  return (
    <div className="premium-card flex flex-col gap-4 !rounded-[14px] !p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">abgelichtet.ch</p>
        <p className="text-lg font-semibold text-slate-950">
          {profile?.role === "admin" ? "Admin-Bereich" : "Kundenbereich"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {profile?.role === "admin" ? <QuickCreateMenu /> : null}
        <div className="relative" ref={notificationRootRef}>
          <NotificationBell
            isOpen={isNotificationOpen}
            onClick={() => setIsNotificationOpen((current) => !current)}
            unreadCount={unreadCountQuery.data ?? 0}
          />
          {isNotificationOpen ? (
            <NotificationDropdown
              isLoading={notificationsQuery.isLoading}
              notifications={notificationsQuery.data ?? []}
              onNotificationClick={handleNotificationClick}
            />
          ) : null}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
          <UserCircle2 className="h-4 w-4 text-violet-600" />
          <span className="font-medium text-slate-800">{user?.email}</span>
        </div>
        <PremiumButton onClick={() => void handleLogout()} variant="secondary">
          <LogOut className="h-4 w-4" />
          Ausloggen
        </PremiumButton>
      </div>
    </div>
  );
}
