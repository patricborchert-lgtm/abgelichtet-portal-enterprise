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

### 5. Edge Secrets setzen

Im Supabase Dashboard oder per CLI:

1. `SUPABASE_URL` auf die Project URL setzen.
2. `SUPABASE_SERVICE_ROLE_KEY` auf den Service Role Key setzen.

### 6. Edge Functions deployen

```bash
supabase functions deploy invite-user
supabase functions deploy log-activity
supabase functions deploy impersonate-client
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
