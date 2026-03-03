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
        <CardTitle className="text-2xl text-slate-950">Client-Daten</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-slate-700" htmlFor="name">
              Name
            </Label>
            <Input
              className="border-slate-200 bg-slate-50/70"
              id="name"
              onChange={(event) => updateValue("name", event.target.value)}
              required
              value={values.name}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700" htmlFor="email">
              E-Mail
            </Label>
            <Input
              className="border-slate-200 bg-slate-50/70"
              id="email"
              onChange={(event) => updateValue("email", event.target.value)}
              required
              type="email"
              value={values.email}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700" htmlFor="company">
              Firma
            </Label>
            <Input
              className="border-slate-200 bg-slate-50/70"
              id="company"
              onChange={(event) => updateValue("company", event.target.value)}
              value={values.company}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700" htmlFor="phone">
              Telefon
            </Label>
            <Input
              className="border-slate-200 bg-slate-50/70"
              id="phone"
              onChange={(event) => updateValue("phone", event.target.value)}
              value={values.phone}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-700" htmlFor="notes">
              Notizen
            </Label>
            <Textarea
              className="border-slate-200 bg-slate-50/70"
              id="notes"
              onChange={(event) => updateValue("notes", event.target.value)}
              value={values.notes}
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
