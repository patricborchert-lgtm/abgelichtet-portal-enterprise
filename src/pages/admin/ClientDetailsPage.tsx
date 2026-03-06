import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { generateInvite, getClientDetails, setClientActiveState, updateClient } from "@/api/clients";
import { logActivity } from "@/api/activity";
import { requestImpersonationLink } from "@/api/impersonation";
import { ClientForm } from "@/components/clients/ClientForm";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { CreateProjectModal, type CreateProjectDraftPayload } from "@/components/projects/CreateProjectModal";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  AlertDialog,
  AlertDialogActionButton,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { persistImpersonationSession } from "@/lib/storage";
import type { ActivityPayload, ClientFormValues } from "@/types/app";

export function ClientDetailsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const params = useParams();
  const clientId = params.id ?? "";
  const queryClient = useQueryClient();
  const { session, user } = useAuth();

  const clientQuery = useQuery({
    enabled: Boolean(clientId),
    queryFn: () => getClientDetails(clientId),
    queryKey: ["client", clientId],
  });

  const updateMutation = useMutation({
    mutationFn: (values: ClientFormValues) => updateClient(clientId, values),
    onSuccess: async () => {
      toast.success("Kunde gespeichert.");
      await queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) => setClientActiveState(clientId, isActive),
    onSuccess: async (_, nextState) => {
      toast.success(nextState ? "Kunde aktiviert." : "Kunde deaktiviert.");
      logActivitySafely({
        action: nextState ? "client_activated" : "client_deactivated",
        entityId: clientId,
        entityType: "client",
        metadata: {},
      });
      await queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (values: ClientFormValues) => generateInvite(values),
    onSuccess: (result) => {
      toast.success("Neuer Invite-Link generiert.");
      void navigator.clipboard.writeText(result.inviteLink);
    },
  });

  function logActivitySafely(payload: ActivityPayload): void {
    void (async () => {
      try {
        await logActivity(payload);
      } catch {
        // Logging must never block business flows.
      }
    })();
  }

  if (clientQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientQuery.isError || !clientQuery.data) {
    return <ErrorState message="Kunde konnte nicht geladen werden." onRetry={() => void clientQuery.refetch()} />;
  }

  const { client, projects } = clientQuery.data;

  async function handleSave(values: ClientFormValues) {
    try {
      await updateMutation.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Kunde konnte nicht gespeichert werden."));
    }
  }

  async function handleReinvite() {
    try {
      await inviteMutation.mutateAsync({
        company: client.company ?? "",
        email: client.email,
        name: client.name,
        notes: client.notes ?? "",
        phone: client.phone ?? "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Invite-Link konnte nicht generiert werden."));
    }
  }

  async function handleImpersonation() {
    try {
      if (!session || !user) {
        throw new Error("Admin-Session fehlt.");
      }

      persistImpersonationSession({
        adminAccessToken: session.access_token,
        adminRefreshToken: session.refresh_token,
        adminUserId: user.id,
        clientId: client.id,
        clientName: client.name,
        returnPath: `/admin/clients/${client.id}`,
      });

      const response = await requestImpersonationLink(client.id);
      window.location.assign(response.redirectUrl);
    } catch (error) {
      toast.error(getErrorMessage(error, "Impersonation konnte nicht gestartet werden."));
    }
  }

  function handleDraftCreate(payload: CreateProjectDraftPayload) {
    // Creation stays local in this step. Final persistence follows in a backend wiring step.
    console.log("Create project draft payload", payload);
    toast.success("Projektentwurf vorbereitet.");
  }

  return (
    <div className="space-y-10">
      <PageHeader
        actions={
          <>
            <Button onClick={() => void handleReinvite()} variant="outline">
              Invite neu generieren
            </Button>
            <Button onClick={() => void handleImpersonation()} variant="outline">
              Als Kunde ansehen
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Projekt erstellen
            </Button>
          </>
        }
        description="Stammdaten, Status, Projekte und Admin-Aktionen für diesen Kunden."
        title={client.name}
      />

      <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
        <ClientForm
          defaultValues={{
            company: client.company ?? "",
            email: client.email,
            name: client.name,
            notes: client.notes ?? "",
            phone: client.phone ?? "",
          }}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSave}
          submitLabel="Änderungen speichern"
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-slate-950">Kundenstatus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <StatusBadge active={client.is_active} />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.05)_0%,rgba(255,255,255,1)_45%)] p-4 text-sm leading-6 text-slate-600">
              <p>Erstellt: {formatDate(client.created_at)}</p>
              <p>E-Mail: {client.email}</p>
            </div>
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={client.is_active ? "destructive" : "default"}>
                  {client.is_active ? "Kunde deaktivieren" : "Kunde aktivieren"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Status ändern</AlertDialogTitle>
                  <AlertDialogDescription>
                    Der Kunde wird per Soft Delete {client.is_active ? "deaktiviert" : "reaktiviert"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancelButton>Abbrechen</AlertDialogCancelButton>
                  <AlertDialogActionButton onClick={() => toggleMutation.mutate(!client.is_active)}>
                    Bestätigen
                  </AlertDialogActionButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-slate-950">Projekte</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <EmptyState description="Für diesen Client existieren noch keine Projekte." title="Keine Projekte" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
              <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
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
                    <TableCell>{project.status}</TableCell>
                    <TableCell>{formatDate(project.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/projects/${project.id}`}>Öffnen</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProjectModal
        defaultClientId={client.id}
        onCreate={handleDraftCreate}
        onOpenChange={setIsCreateModalOpen}
        open={isCreateModalOpen}
      />
    </div>
  );
}
