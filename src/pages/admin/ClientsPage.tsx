import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listClients } from "@/api/clients";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAGE_SIZE } from "@/lib/constants";
import { buildPaginationLabel, compareStrings, formatDate } from "@/lib/utils";

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: listClients });

  if (clientsQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientsQuery.isError) {
    return <ErrorState message="Clients konnten nicht geladen werden." onRetry={() => void clientsQuery.refetch()} />;
  }

  const filtered = clientsQuery.data
    .filter((client) => {
      const haystack = `${client.name} ${client.email} ${client.company ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    .sort((left, right) => compareStrings(left.name, right.name));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild>
            <Link to="/admin/clients/new">Client anlegen</Link>
          </Button>
        }
        description="Verwalten Sie Kundenzugaenge, Stammdaten und Invite-Links."
        title="Clients"
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <Input
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Client suchen..."
            value={search}
          />

          {visibleRows.length === 0 ? (
            <EmptyState description="Es wurden keine Clients gefunden." title="Keine Treffer" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge active={client.is_active} />
                    </TableCell>
                    <TableCell>{formatDate(client.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/clients/${client.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{buildPaginationLabel(currentPage, totalPages)}</p>
            <div className="flex items-center gap-2">
              <Button disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} variant="outline">
                Zurueck
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
    </div>
  );
}
