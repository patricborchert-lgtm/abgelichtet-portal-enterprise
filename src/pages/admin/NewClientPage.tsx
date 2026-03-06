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
      toast.success("Kunde erstellt und Invite-Link generiert.");
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  async function handleSubmit(values: ClientFormValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Kunde konnte nicht erstellt werden."));
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
    <div className="space-y-8">
      <PageHeader description="Lege einen neuen Kunden an und erzeuge direkt den passenden Invite-Link." title="Neuer Kunde" />
      <ClientForm isSubmitting={mutation.isPending} onSubmit={handleSubmit} submitLabel="Kunden erstellen" />

      {inviteResult ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Einladung</p>
            <CardTitle className="text-2xl text-slate-950">Invite-Link</CardTitle>
            <CardDescription className="leading-6 text-slate-500">
              Der Link wird nur angezeigt. Den Versand übernimmst du manuell.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.05)_0%,rgba(255,255,255,1)_45%)] p-4 text-sm leading-6 text-slate-700 break-all">
              {inviteResult.inviteLink}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void copyInviteLink()} variant="outline">
                Link kopieren
              </Button>
              <Button asChild>
                <Link to={`/admin/clients/${inviteResult.clientId}`}>Zu Kundendetails</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
