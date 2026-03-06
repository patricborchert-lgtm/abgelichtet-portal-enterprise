import { useQuery } from "@tanstack/react-query";
import { listRecentActivity } from "@/api/activity";
import { listClients } from "@/api/clients";
import { getProjectWorkspaceSummary } from "@/api/dashboard";
import { listAdminProjects } from "@/api/projects";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

function getProgressFromStatus(status: string): number {
  switch (status) {
    case "planned":
      return 20;
    case "active":
      return 55;
    case "review":
      return 80;
    case "delivered":
      return 100;
    case "archived":
      return 100;
    default:
      return 0;
  }
}

export function AdminDashboardPage() {
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const projectsQuery = useQuery({ queryKey: ["projects", "admin"], queryFn: listAdminProjects });
  const activityQuery = useQuery({ queryKey: ["activity", "recent"], queryFn: () => listRecentActivity(10) });
  const workspaceQuery = useQuery({
    enabled: Boolean(projectsQuery.data?.length),
    queryKey: ["dashboard", "workspace", "admin", projectsQuery.data?.map((project) => project.id).join(",") ?? ""],
    queryFn: () => getProjectWorkspaceSummary((projectsQuery.data ?? []).map((project) => project.id)),
  });

  if (clientsQuery.isLoading || projectsQuery.isLoading || activityQuery.isLoading || workspaceQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientsQuery.isError || projectsQuery.isError || activityQuery.isError || workspaceQuery.isError) {
    return <ErrorState message="Dashboard-Daten konnten nicht geladen werden." />;
  }

  const clients = clientsQuery.data;
  const projects = projectsQuery.data;
  const activity = activityQuery.data;
  const workspace = workspaceQuery.data ?? {};
  const activeClients = clients.filter((client) => client.is_active).length;
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const pendingApprovals = Object.values(workspace).reduce((total, entry) => total + entry.pendingApprovals, 0);
  const recentMessages = Object.values(workspace).reduce((total, entry) => total + entry.messageCount, 0);
  const timelineEntries = Object.values(workspace).reduce((total, entry) => total + entry.timelineCount, 0);
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="space-y-10">
      <PageHeader
        description="Behalte aktive Kunden, laufende Projekte und letzte Aktivitäten zentral im Blick."
        title="Admin-Dashboard"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <PremiumCard className="overflow-hidden" subtitle="Kunden" title="Aktive Kunden">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">{activeClients}</span>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              Live
            </span>
          </div>
        </PremiumCard>
        <PremiumCard className="overflow-hidden" subtitle="Projekte" title="Projekte in Arbeit">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">{activeProjects}</span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
              Aktiv
            </span>
          </div>
        </PremiumCard>
        <PremiumCard className="overflow-hidden" subtitle="Abnahme" title="Offene Freigaben">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">{pendingApprovals}</span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700">
              Offen
            </span>
          </div>
        </PremiumCard>
        <PremiumCard className="overflow-hidden" subtitle="Kommunikation" title="Nachrichten & Timeline">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-4xl font-semibold tracking-tight text-slate-950">{recentMessages}</span>
              <p className="mt-2 text-xs text-slate-500">{timelineEntries} Timeline-Einträge</p>
            </div>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
              Verlauf
            </span>
          </div>
        </PremiumCard>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Projekt-Übersicht</p>
                <CardTitle className="mt-1 text-2xl text-slate-950">Aktuelle Projekte</CardTitle>
              </div>
              <div
                className="hidden h-12 w-12 rounded-2xl md:block"
                style={{ background: "linear-gradient(135deg, rgba(143,135,241,0.20) 0%, rgba(143,135,241,0.05) 100%)" }}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {recentProjects.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState description="Noch keine Projekte vorhanden." title="Keine Projekte" />
              </div>
            ) : (
              recentProjects.map((project) => {
                const progress = getProgressFromStatus(project.status);
                const projectWorkspace = workspace[project.id];
                const milestoneProgress =
                  projectWorkspace && projectWorkspace.totalMilestones > 0
                    ? Math.round((projectWorkspace.completedMilestones / projectWorkspace.totalMilestones) * 100)
                    : 0;

                return (
                  <div
                    className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.05)_0%,rgba(255,255,255,1)_35%)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                    key={project.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Projekt</p>
                        <h3 className="text-lg font-semibold text-slate-950">{project.title}</h3>
                        <p className="text-sm text-slate-500">{project.clients?.name ?? "Kein Kunde zugewiesen"}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Fortschritt</span>
                        <span className="font-medium text-slate-700">{progress}%</span>
                      </div>
                      <div className="premium-progress-bg h-2.5">
                        <div
                          className="premium-progress-bar"
                          style={{
                            background: "linear-gradient(90deg, #8F87F1 0%, #B7B1FF 100%)",
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Offene Abnahmen</span>
                        <span className="font-medium text-slate-900">{projectWorkspace?.pendingApprovals ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Nachrichten</span>
                        <span className="font-medium text-slate-900">{projectWorkspace?.messageCount ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Meilensteine</span>
                        <span className="font-medium text-slate-900">
                          {projectWorkspace?.completedMilestones ?? 0}/{projectWorkspace?.totalMilestones ?? 0} ({milestoneProgress}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {projectWorkspace?.latestActivityAt
                          ? `Letzte Aktivität ${formatDate(projectWorkspace.latestActivityAt)}`
                          : `Erstellt am ${formatDate(project.created_at)}`}
                      </span>
                      <span>{project.id.slice(0, 8)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm font-medium text-slate-500">Aktivität</p>
            <CardTitle className="text-2xl text-slate-950">Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              emptyDescription="Noch keine Einträge vorhanden."
              emptyTitle="Keine Aktivitäten"
              events={activity}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
