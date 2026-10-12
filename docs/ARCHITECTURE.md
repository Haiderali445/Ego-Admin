# Architecture

## Scope

`ego-admin` is a standalone Vite/React application for managing portfolio content. It is a browser client, not a trusted application server: domain services call Supabase directly with the public publishable key and the signed-in user's Supabase session. PostgreSQL RLS is the actual database authorization boundary.

## System Context

```mermaid
flowchart LR
  Admin[Admin browser]
  SupabaseAuth[Supabase Auth]
  PostgREST[Supabase PostgREST]
  DB[(PostgreSQL)]
  PublicSite[ego-web public site]

  Admin -->|email/password sign-in| SupabaseAuth
  SupabaseAuth -->|JWT session| Admin
  Admin -->|domain reads and writes with JWT| PostgREST
  PostgREST -->|RLS policies| DB
  PublicSite -->|public reads with publishable key| PostgREST
```

The frontend PIN prompt is a client-side gate only. It does not strengthen the JWT and must not be treated as database authorization. See [Security](SECURITY.md).

## Application Architecture

```mermaid
flowchart TD
  Routes[React Router routes]
  Pages[Domain pages and CRUD forms]
  Query[TanStack Query server state]
  Domain[services/modules domain services]
  Repo[BaseRepository]
  Guard[AuthService session and client-side PIN check]
  Client[Supabase browser client]
  RLS[PostgreSQL Row Level Security]
  Tables[(Domain and child tables)]

  Routes --> Pages
  Pages --> Query
  Query --> Domain
  Domain --> Repo
  Repo --> Guard
  Repo --> Client
  Domain --> Client
  Client --> RLS --> Tables
```

- Pages own presentation, forms, and TanStack Query mutations.
- Domain services own table-specific reads and child-row synchronization.
- `BaseRepository` supplies generic CRUD and mutation authorization checks.
- `AuthService` verifies the active Supabase session and local PIN state before repository mutations.
- Supabase RLS policies must independently enforce writes. Client checks are not a substitute for RLS.

## CRUD Request Sequence

```mermaid
sequenceDiagram
  actor Admin
  participant Page as CRUD page
  participant Query as TanStack Query
  participant Service as Domain service
  participant Guard as AuthService
  participant API as Supabase PostgREST
  participant RLS as PostgreSQL RLS
  participant DB as PostgreSQL

  Admin->>Page: Submit validated form
  Page->>Query: Run mutation
  Query->>Service: create/update/delete
  Service->>Guard: Assert session and local PIN
  Guard-->>Service: Current session
  Service->>API: Request with user's JWT
  API->>RLS: Evaluate table policy
  RLS->>DB: Execute allowed operation
  DB-->>API: Row or database error
  API-->>Service: Supabase result
  Service-->>Query: Return result or throw error
  Query-->>Page: Show feedback and invalidate query
```

Child-table changes are separate requests from parent writes; they are not a single database transaction. For operations that require all-or-nothing behavior, move the workflow into a PostgreSQL function/RPC and invoke that function from the domain service.

## Authentication State

```mermaid
stateDiagram-v2
  [*] --> SignedOut
  SignedOut --> CredentialsPending: Submit email and password
  CredentialsPending --> SignedOut: Supabase rejects credentials
  CredentialsPending --> PinPending: Supabase returns session
  PinPending --> PinPending: PIN rejected
  PinPending --> MutationEnabled: PIN accepted in this browser session
  MutationEnabled --> SignedOut: Sign out
  MutationEnabled --> SignedOut: Supabase session expires
```

The current implementation stores PIN verification in `sessionStorage`. It is cleared on logout or when the browser session ends. It is not Supabase MFA and is not independently verified by RLS.

## Domain Data Flow

```mermaid
flowchart LR
  Profile[Profile page] --> ProfileService[profileService]
  Projects[Projects page] --> ProjectsService[projectsService]
  Experience[Experience page] --> ExperienceService[experienceService]
  Services[Services page] --> ServicesService[servicesService]
  Solutions[Solutions page] --> SolutionsService[solutionsService]
  Other[Education, skills, pricing, testimonials, config, terminal pages] --> OtherServices[Domain services]
  ProfileService --> Supabase[Supabase client]
  ProjectsService --> Supabase
  ExperienceService --> Supabase
  ServicesService --> Supabase
  SolutionsService --> Supabase
  OtherServices --> Supabase
```

## Source Layout

```text
apps/ego-admin/
|-- public/                         Static files served from the site root
|-- supabase/migrations/            SQL changes for the Supabase project
|-- docs/                           Architecture, schema, deployment, security
|-- src/
|   |-- App.jsx                     Route definitions
|   |-- components/
|   |   |-- common/                 Shared page and data-table primitives
|   |   |-- layout/                 Sidebar, header, route layout
|   |   `-- theme/                  Ant Design theme provider
|   |-- context/                    Auth context and session state
|   |-- core/                       Supabase client, repository, auth, logger
|   |-- pages/                      Dashboard and domain CRUD screens
|   |-- services/modules/           Domain repositories and services
|   |-- stores/                     Local UI state only
|   `-- styles/                     Tailwind and global styles
|-- index.html
|-- package.json
|-- netlify.toml
`-- vercel.json
```

For the exact table and column contract, see [Database](DATABASE.md). For build and rewrite configuration, see [Deployment](DEPLOYMENT.md).
