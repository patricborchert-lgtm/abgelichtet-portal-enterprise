import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import type { ClientFormValues } from "@/types/app";

export function ClientDetailsPage() {
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
      toast.success("Client gespeichert.");
      await queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) => setClientActiveState(clientId, isActive),
    onSuccess: async (_, nextState) => {
      toast.success(nextState ? "Client aktiviert." : "Client deaktiviert.");
      await logActivity({
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

  if (clientQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientQuery.isError || !clientQuery.data) {
    return <ErrorState message="Client konnte nicht geladen werden." onRetry={() => void clientQuery.refetch()} />;
  }

  const { client, projects } = clientQuery.data;

  async function handleSave(values: ClientFormValues) {
    try {
      await updateMutation.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Client konnte nicht gespeichert werden."));
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

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button onClick={() => void handleReinvite()} variant="outline">
              Invite neu generieren
            </Button>
            <Button onClick={() => void handleImpersonation()} variant="outline">
              Als Client ansehen
            </Button>
            <Button asChild>
              <Link to="/admin/projects/new">Projekt erstellen</Link>
            </Button>
          </>
        }
        description="Stammdaten, Status, Projekte und Admin-Aktionen fuer diesen Client."
        title={client.name}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
          submitLabel="Aenderungen speichern"
        />

        <Card>
          <CardHeader>
            <CardTitle>Client Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <span className="text-sm font-medium">Status</span>
              <StatusBadge active={client.is_active} />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Erstellt: {formatDate(client.created_at)}</p>
              <p>E-Mail: {client.email}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={client.is_active ? "destructive" : "default"}>
                  {client.is_active ? "Client deaktivieren" : "Client aktivieren"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Status aendern</AlertDialogTitle>
                  <AlertDialogDescription>
                    Der Client wird per Soft Delete {client.is_active ? "deaktiviert" : "reaktiviert"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancelButton>Abbrechen</AlertDialogCancelButton>
                  <AlertDialogActionButton onClick={() => toggleMutation.mutate(!client.is_active)}>
                    Bestaetigen
                  </AlertDialogActionButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projekte</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <EmptyState description="Fuer diesen Client existieren noch keine Projekte." title="Keine Projekte" />
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
                    <TableCell>{project.status}</TableCell>
                    <TableCell>{formatDate(project.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/projects/${project.id}`}>Oeffnen</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
