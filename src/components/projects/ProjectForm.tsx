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
    <Card>
      <CardHeader>
        <CardTitle>Projekt</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              onChange={(event) => updateValue("title", event.target.value)}
              required
              value={values.title}
            />
          </div>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select onValueChange={(value) => updateValue("clientId", value)} value={values.clientId}>
              <SelectTrigger>
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
            <Label>Status</Label>
            <Select onValueChange={(value) => updateValue("status", value as ProjectFormValues["status"])} value={values.status}>
              <SelectTrigger>
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
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              onChange={(event) => updateValue("description", event.target.value)}
              value={values.description}
            />
          </div>
          <div className="md:col-span-2">
            <Button disabled={isSubmitting} type="submit">
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
