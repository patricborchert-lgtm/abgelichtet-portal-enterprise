import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listRecentActivity } from "@/api/activity";
import { listMyProjects } from "@/api/projects";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
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

export function ClientDashboardPage() {
  const projectsQuery = useQuery({ queryKey: ["projects", "mine"], queryFn: listMyProjects });
  const activityQuery = useQuery({ queryKey: ["activity", "mine"], queryFn: () => listRecentActivity(8) });

  if (projectsQuery.isLoading || activityQuery.isLoading) {
    return <LoadingTable />;
  }

  if (projectsQuery.isError || activityQuery.isError) {
    return <ErrorState message="Dashboard konnte nicht geladen werden." />;
  }

  const projects = projectsQuery.data;
  const activity = activityQuery.data;
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader description="Behalte deine Projekte, Freigaben und letzten Aktivitäten zentral im Blick." title="Client Dashboard" />

      <div className="grid gap-5 md:grid-cols-3">
        <Card
          className="overflow-hidden border-white/70 bg-white shadow-[0_18px_45px_rgba(143,135,241,0.12)]"
          style={{ borderRadius: 16 }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
          />
          <CardHeader className="pb-3">
            <p className="text-sm font-medium text-slate-500">In Arbeit</p>
            <CardTitle className="text-base text-slate-800">Laufende Projekte</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">
              {projects.filter((project) => project.status === "active").length}
            </span>
            <span className="rounded-full bg-[#8F87F1]/10 px-3 py-1 text-xs font-medium text-[#6E65D8]">
              Fokus
            </span>
          </CardContent>
        </Card>
        <Card
          className="overflow-hidden border-white/70 bg-white shadow-[0_18px_45px_rgba(143,135,241,0.12)]"
          style={{ borderRadius: 16 }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
          />
          <CardHeader className="pb-3">
            <p className="text-sm font-medium text-slate-500">Feedback</p>
            <CardTitle className="text-base text-slate-800">In Prüfung</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">
              {projects.filter((project) => project.status === "review").length}
            </span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700">
              Offen
            </span>
          </CardContent>
        </Card>
        <Card
          className="overflow-hidden border-white/70 bg-white shadow-[0_18px_45px_rgba(143,135,241,0.12)]"
          style={{ borderRadius: 16 }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
          />
          <CardHeader className="pb-3">
            <p className="text-sm font-medium text-slate-500">Abgeschlossen</p>
            <CardTitle className="text-base text-slate-800">Gelieferte Projekte</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-4xl font-semibold tracking-tight text-slate-950">
              {projects.filter((project) => project.status === "delivered").length}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
              Fertig
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card
          className="border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
          style={{ borderRadius: 16 }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Meine Übersicht</p>
                <CardTitle className="mt-1 text-2xl text-slate-950">Meine Projekte</CardTitle>
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
                <EmptyState description="Aktuell sind keine Projekte sichtbar." title="Keine Projekte" />
              </div>
            ) : (
              recentProjects.map((project) => {
                const progress = getProgressFromStatus(project.status);

                return (
                  <div
                    className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.05)_0%,rgba(255,255,255,1)_35%)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                    key={project.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Projekt</p>
                        <h3 className="text-lg font-semibold text-slate-950">{project.title}</h3>
                        <p className="text-sm text-slate-500">Erstellt am {formatDate(project.created_at)}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Fortschritt</span>
                        <span className="font-medium text-slate-700">{progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: "linear-gradient(90deg, #8F87F1 0%, #B7B1FF 100%)",
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <Button asChild className="w-full" size="sm">
                        <Link to={`/project/${project.id}`}>Projekt öffnen</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card
          className="border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
          style={{ borderRadius: 16 }}
        >
          <CardHeader className="pb-3">
            <p className="text-sm font-medium text-slate-500">Aktivität</p>
            <CardTitle className="text-2xl text-slate-950">Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <EmptyState description="Noch keine Aktivitäten sichtbar." title="Keine Aktivitäten" />
            ) : (
              activity.map((entry) => (
                <div
                  className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.04)_0%,rgba(255,255,255,1)_45%)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                  key={entry.id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-950">{entry.action}</p>
                    <p className="text-xs text-slate-400">{formatDate(entry.created_at)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Dein Projekt wurde aktualisiert.</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
