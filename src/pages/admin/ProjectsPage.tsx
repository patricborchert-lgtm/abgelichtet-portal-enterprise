import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { listAdminProjects } from "@/api/projects";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { CreateProjectModal, type CreateProjectDraftPayload } from "@/components/projects/CreateProjectModal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAGE_SIZE } from "@/lib/constants";
import { buildPaginationLabel, compareStrings, formatDate } from "@/lib/utils";

export function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const projectsQuery = useQuery({ queryKey: ["projects", "admin"], queryFn: listAdminProjects });

  function handleDraftCreate(payload: CreateProjectDraftPayload) {
    // Creation stays local in this step. Final persistence follows in a backend wiring step.
    console.log("Create project draft payload", payload);
    toast.success("Projektentwurf vorbereitet.");
  }

  if (projectsQuery.isLoading) {
    return <LoadingTable />;
  }

  if (projectsQuery.isError) {
    return <ErrorState message="Projekte konnten nicht geladen werden." onRetry={() => void projectsQuery.refetch()} />;
  }

  const filtered = projectsQuery.data
    .filter((project) => {
      const haystack = `${project.title} ${project.description ?? ""} ${project.clients?.name ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    .sort((left, right) => compareStrings(left.title, right.title));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Projekt anlegen
          </Button>
        }
        description="Behalte Projektstatus, Zuordnungen und die operative Arbeit im Blick."
        title="Projekte"
      />

      <Card
        className="overflow-hidden"
      >
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Übersicht</p>
            <p className="text-sm text-slate-500">Verfolge Status, Client-Zuordnung und Einstieg in jedes Projekt.</p>
          </div>
          <Input
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Projekt suchen..."
            value={search}
          />

          {visibleRows.length === 0 ? (
            <EmptyState description="Es wurden keine Projekte gefunden." title="Keine Treffer" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
              <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="text-slate-500">Titel</TableHead>
                  <TableHead className="text-slate-500">Client</TableHead>
                  <TableHead className="text-slate-500">Status</TableHead>
                  <TableHead className="text-slate-500">Erstellt</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((project) => (
                  <TableRow className="hover:bg-[#8F87F1]/[0.04]" key={project.id}>
                    <TableCell className="font-medium text-slate-900">{project.title}</TableCell>
                    <TableCell className="text-slate-600">{project.clients?.name ?? "Unbekannt"}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">{formatDate(project.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/projects/${project.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{buildPaginationLabel(currentPage, totalPages)}</p>
            <div className="flex gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
                variant="outline"
              >
                Zurück
              </Button>
              <Button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
                variant="outline"
              >
                Weiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateProjectModal
        onCreate={handleDraftCreate}
        onOpenChange={setIsCreateModalOpen}
        open={isCreateModalOpen}
      />
    </div>
  );
}
