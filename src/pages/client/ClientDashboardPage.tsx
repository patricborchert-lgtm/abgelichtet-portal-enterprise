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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <PageHeader description="Ihre Projekte, Freigaben und Dateien auf einen Blick." title="Client Dashboard" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {projects.filter((project) => project.status === "active").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {projects.filter((project) => project.status === "review").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivered</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {projects.filter((project) => project.status === "delivered").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meine Projekte</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <EmptyState description="Aktuell sind keine Projekte sichtbar." title="Keine Projekte" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>{formatDate(project.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/project/${project.id}`}>Oeffnen</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitaeten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 ? (
            <EmptyState description="Noch keine Aktivitaeten sichtbar." title="Keine Aktivitaeten" />
          ) : (
            activity.map((entry) => (
              <div className="rounded-xl border p-4" key={entry.id}>
                <p className="font-medium text-slate-950">{entry.action}</p>
                <p className="text-sm text-muted-foreground">{formatDate(entry.created_at)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
