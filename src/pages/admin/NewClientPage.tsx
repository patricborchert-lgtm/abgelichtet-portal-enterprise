import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateInvite } from "@/api/clients";
import { ClientForm } from "@/components/clients/ClientForm";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/errors";
import type { ClientFormValues, InviteUserResponse } from "@/types/app";

export function NewClientPage() {
  const queryClient = useQueryClient();
  const [inviteResult, setInviteResult] = useState<InviteUserResponse | null>(null);
  const mutation = useMutation({
    mutationFn: generateInvite,
    onSuccess: async (data) => {
      setInviteResult(data);
      toast.success("Client erstellt und Invite-Link generiert.");
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  async function handleSubmit(values: ClientFormValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Client konnte nicht erstellt werden."));
    }
  }

  async function copyInviteLink() {
    if (!inviteResult) {
      return;
    }

    await navigator.clipboard.writeText(inviteResult.inviteLink);
    toast.success("Invite-Link kopiert.");
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Legt den Client an und erzeugt direkt einen Invite-Link." title="Neuer Client" />
      <ClientForm isSubmitting={mutation.isPending} onSubmit={handleSubmit} submitLabel="Client erstellen" />

      {inviteResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Invite-Link</CardTitle>
            <CardDescription>Der Link wird nur angezeigt. Versand erfolgt manuell durch den Admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-slate-50 p-4 text-sm break-all">{inviteResult.inviteLink}</div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void copyInviteLink()} variant="outline">
                Link kopieren
              </Button>
              <Button asChild>
                <Link to={`/admin/clients/${inviteResult.clientId}`}>Zu Client-Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
