# abgelichtet-portal-enterprise

## Struktur

```text
abgelichtet-portal-enterprise
├── .env.example
├── .gitignore
├── README.md
├── components.json
├── index.html
├── package.json
├── postcss.config.js
├── public
│   └── favicon.svg
├── src
│   ├── App.tsx
│   ├── api
│   │   ├── activity.ts
│   │   ├── clients.ts
│   │   ├── files.ts
│   │   ├── impersonation.ts
│   │   └── projects.ts
│   ├── components
│   │   ├── auth
│   │   │   └── ProtectedRoute.tsx
│   │   ├── clients
│   │   │   └── ClientForm.tsx
│   │   ├── common
│   │   │   ├── AppErrorFallback.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── ImpersonationBanner.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingTable.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── files
│   │   │   └── FileUploadCard.tsx
│   │   ├── layout
│   │   │   ├── AppShell.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── projects
│   │   │   └── ProjectForm.tsx
│   │   └── ui
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── table.tsx
│   │       └── textarea.tsx
│   ├── contexts
│   │   └── AuthProvider.tsx
│   ├── hooks
│   │   └── useAuth.ts
│   ├── index.css
│   ├── integrations
│   │   └── supabase
│   │       └── client.ts
│   ├── lib
│   │   ├── auth-links.ts
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   ├── errors.ts
│   │   ├── query-client.ts
│   │   ├── storage.ts
│   │   └── utils.ts
│   ├── main.tsx
│   ├── pages
│   │   ├── AuthCallbackPage.tsx
│   │   ├── HomeRedirectPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFound.tsx
│   │   ├── SetPasswordPage.tsx
│   │   ├── admin
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── ClientDetailsPage.tsx
│   │   │   ├── ClientsPage.tsx
│   │   │   ├── NewClientPage.tsx
│   │   │   ├── NewProjectPage.tsx
│   │   │   ├── ProjectDetailsPage.tsx
│   │   │   └── ProjectsPage.tsx
│   │   └── client
│   │       └── ClientDashboardPage.tsx
│   ├── types
│   │   ├── app.ts
│   │   └── database.ts
│   └── vite-env.d.ts
├── supabase
│   ├── config.toml
│   ├── functions
│   │   ├── _shared
│   │   │   ├── auth.ts
│   │   │   └── cors.ts
│   │   ├── impersonate-client
│   │   │   └── index.ts
│   │   ├── invite-user
│   │   │   └── index.ts
│   │   └── log-activity
│   │       └── index.ts
│   └── migrations
│       ├── 202603030001_initial_schema.sql
│       ├── 202603030002_rls_policies.sql
│       └── 202603030003_storage_policies.sql
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## Setup

### 1. Supabase Projekt erstellen

1. Neues Supabase-Projekt anlegen.
2. Unter `Project Settings > API` folgende Werte kopieren:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

### 2. Auth Settings setzen

1. In `Authentication > URL Configuration`:
   - `Site URL`: `https://portal.abgelichtet.ch`
   - `Redirect URLs`:
     - `https://portal.abgelichtet.ch/set-password`
     - `https://portal.abgelichtet.ch/auth/callback`
     - `http://localhost:5173/set-password`
     - `http://localhost:5173/auth/callback`

### 3. Storage Bucket erstellen

1. Der Bucket `project-files` wird bereits in Migration `202603030001_initial_schema.sql` angelegt.
2. Falls die Migration nicht ueber SQL Editor, sondern manuell ausgefuehrt wird, pruefen, dass der Bucket existiert.

### 4. SQL Migrations ausfuehren

Im Supabase SQL Editor in dieser Reihenfolge ausfuehren:

1. `supabase/migrations/202603030001_initial_schema.sql`
2. `supabase/migrations/202603030002_rls_policies.sql`
3. `supabase/migrations/202603030003_storage_policies.sql`
4. `supabase/migrations/202603030004_project_workspace.sql`
5. `supabase/migrations/202603030005_project_workspace_rls.sql`
6. `supabase/migrations/202603040006_project_messages.sql`
7. `supabase/migrations/202603040007_project_messages_rls.sql`
8. `supabase/migrations/202603040008_notifications.sql`
9. `supabase/migrations/202603040009_notifications_rls.sql`
10. `supabase/migrations/202603040010_reminder_rules_and_history.sql`
11. `supabase/migrations/202603040011_reminder_rules_and_history_rls.sql`
12. `supabase/migrations/202603040012_approval_steps.sql`
13. `supabase/migrations/202603040013_auto_archive_on_final_approval.sql`

### 5. Edge Secrets setzen

Im Supabase Dashboard oder per CLI:

1. `SUPABASE_URL` auf die Project URL setzen.
2. `SUPABASE_SERVICE_ROLE_KEY` auf den Service Role Key setzen.
3. `BREVO_API_KEY` auf den Brevo API Key setzen.
4. `BREVO_SENDER_EMAIL` auf die Absenderadresse setzen.
5. Optional: `BREVO_SENDER_NAME` fuer den sichtbaren Absendernamen setzen.
6. Optional: `BREVO_NOTIFICATION_EMAIL` fuer interne Projektbenachrichtigungen setzen.
7. `REMINDER_CRON_SECRET` fuer gesicherte Reminder-Cron-Aufrufe setzen.

Beispiel per CLI:

```bash
supabase secrets set \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  BREVO_API_KEY=... \
  BREVO_SENDER_EMAIL=... \
  BREVO_SENDER_NAME="abgelichtet.ch" \
  BREVO_NOTIFICATION_EMAIL=... \
  REMINDER_CRON_SECRET=...
```

### 6. Edge Functions deployen

```bash
supabase functions deploy invite-user
supabase functions deploy log-activity
supabase functions deploy impersonate-client
supabase functions deploy send-project-email
supabase functions deploy check-reminders
```

### 7. Frontend lokal starten

1. `.env.example` nach `.env` kopieren.
2. Werte setzen:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. Abhaengigkeiten installieren und starten:

```bash
npm install
npm run dev
```

### 8. Vercel Environment Variablen setzen

In Vercel fuer das Frontend:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 9. Vercel deployen

1. Repo nach GitHub pushen.
2. In Vercel importieren.
3. Build Command: `npm run build`
4. Output Directory: `dist`

### 10. Reminder Cron einrichten

In Supabase unter `Edge Functions > check-reminders > Schedules`:

1. Cron: `0 * * * *`
2. Methode: `POST`
3. Header setzen:
   - `x-reminder-secret: <REMINDER_CRON_SECRET>`

## Hinweise

- Invite Flow:
  - Admin legt Client ueber `/admin/clients/new` an.
  - Edge Function `invite-user` gibt den Invite-Link zurueck.
  - Der Admin versendet den Link selbst.
- Impersonation:
  - Edge Function `impersonate-client` erzeugt einen Magic Link.
  - Die aktuelle Admin-Session wird vor dem Wechsel lokal gespeichert.
  - Rueckkehr erfolgt ueber den Banner im Client-Kontext.
- Logging:
  - UI-Events schreiben ueber `log-activity` in `activity_log`.
  - Sicherheitsrelevante Aktionen werden zusaetzlich in `audit_log` geschrieben.
- Projekt-E-Mails:
  - Edge Function `send-project-email` versendet Brevo-Mails fuer `Projekt erstellt`, `Abnahme angefordert`, `Aenderungen angefordert` und `Abgenommen`.
  - Reminder-Ereignisse `approval_reminder` und `feedback_reminder` werden ebenfalls ueber `send-project-email` versendet.
  - Mail-Fehler blockieren keine Business-Flows.
