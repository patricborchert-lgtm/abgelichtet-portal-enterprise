import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ClientFormValues } from "@/types/app";

interface ClientFormProps {
  defaultValues?: ClientFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  submitLabel: string;
}

const initialValues: ClientFormValues = {
  company: "",
  email: "",
  name: "",
  notes: "",
  phone: "",
};

export function ClientForm({ defaultValues, isSubmitting = false, onSubmit, submitLabel }: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(defaultValues ?? initialValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  function updateValue<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client-Daten</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              onChange={(event) => updateValue("name", event.target.value)}
              required
              value={values.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              onChange={(event) => updateValue("email", event.target.value)}
              required
              type="email"
              value={values.email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Firma</Label>
            <Input id="company" onChange={(event) => updateValue("company", event.target.value)} value={values.company} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" onChange={(event) => updateValue("phone", event.target.value)} value={values.phone} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" onChange={(event) => updateValue("notes", event.target.value)} value={values.notes} />
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
