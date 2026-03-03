import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_STATUS_OPTIONS } from "@/lib/constants";
import type { Client, ProjectFormValues } from "@/types/app";

interface ProjectFormProps {
  clientOptions: Client[];
  defaultValues?: ProjectFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  submitLabel: string;
}

const initialValues: ProjectFormValues = {
  clientId: "",
  description: "",
  status: "planned",
  title: "",
};

export function ProjectForm({
  clientOptions,
  defaultValues,
  isSubmitting = false,
  onSubmit,
  submitLabel,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(defaultValues ?? initialValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  function updateValue<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Card
      className="overflow-hidden border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      style={{ borderRadius: 16 }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
      />
      <CardHeader className="pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Verwaltung</p>
        <CardTitle className="text-2xl text-slate-950">Projekt</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-700" htmlFor="title">
              Titel
            </Label>
            <Input
              className="border-slate-200 bg-slate-50/70"
              id="title"
              onChange={(event) => updateValue("title", event.target.value)}
              required
              value={values.title}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Client</Label>
            <Select onValueChange={(value) => updateValue("clientId", value)} value={values.clientId}>
              <SelectTrigger className="border-slate-200 bg-slate-50/70">
                <SelectValue placeholder="Client waehlen" />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Status</Label>
            <Select onValueChange={(value) => updateValue("status", value as ProjectFormValues["status"])} value={values.status}>
              <SelectTrigger className="border-slate-200 bg-slate-50/70">
                <SelectValue placeholder="Status waehlen" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-700" htmlFor="description">
              Beschreibung
            </Label>
            <Textarea
              className="border-slate-200 bg-slate-50/70"
              id="description"
              onChange={(event) => updateValue("description", event.target.value)}
              value={values.description}
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <Button
              className="min-w-[220px] bg-[#8F87F1] text-white hover:bg-[#7c74e2]"
              disabled={isSubmitting}
              type="submit"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
