import { useQuery } from "@tanstack/react-query";
import { listRecentActivity } from "@/api/activity";
import { listClients } from "@/api/clients";
import { listAdminProjects } from "@/api/projects";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function AdminDashboardPage() {
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const projectsQuery = useQuery({ queryKey: ["projects", "admin"], queryFn: listAdminProjects });
  const activityQuery = useQuery({ queryKey: ["activity", "recent"], queryFn: () => listRecentActivity(10) });

  if (clientsQuery.isLoading || projectsQuery.isLoading || activityQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientsQuery.isError || projectsQuery.isError || activityQuery.isError) {
    return <ErrorState message="Dashboard-Daten konnten nicht geladen werden." />;
  }

  const clients = clientsQuery.data;
  const projects = projectsQuery.data;
  const activity = activityQuery.data;
  const activeClients = clients.filter((client) => client.is_active).length;
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const archivedProjects = projects.filter((project) => project.status === "archived").length;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Uebersicht ueber aktive Clients, Projekte und sicherheitsrelevante Vorgaenge."
        title="Admin Dashboard"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Clients</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeClients}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeProjects}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Archived Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{archivedProjects}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitaeten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 ? (
            <EmptyState description="Noch keine Eintraege vorhanden." title="Keine Aktivitaeten" />
          ) : (
            activity.map((entry) => (
              <div className="flex flex-col gap-1 rounded-xl border p-4" key={entry.id}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-950">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {entry.entity_type}
                  {entry.entity_id ? ` · ${entry.entity_id}` : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
