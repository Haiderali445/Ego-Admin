# Deployment and Runtime

## Requirements

- Node.js 18 or newer (Node 18 is pinned in `.nvmrc`).
- npm and the committed `package-lock.json`.
- A Supabase project configured with the expected schema and RLS policies.

## Local Development

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Environment Variables

| Variable | Required | Purpose | Browser-visible |
|---|---:|---|---:|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable/anonymous browser key | Yes |
| `VITE_ADMIN_2FA_PIN` | Current code expects it | Client-side PIN gate | Yes |

Every `VITE_*` variable is embedded in client code. The PIN is not a server-side secret or a substitute for Supabase MFA/RLS. Do not add service-role keys, passwords, private GitHub tokens, or other secrets to `VITE_*` variables.

## Production Build

```bash
npm ci
npm run build
npm run preview
```

Vite writes the static site to `dist/`. The app uses React Router `BrowserRouter`, so the hosting provider must rewrite unknown paths such as `/profile` and `/experience` to `/index.html`.

## Vercel

Set the Vercel project root to this app directory (`apps/ego-admin` if deploying from a monorepo root). `vercel.json` configures the Vite build output and SPA rewrite. Add the required public Vite variables in the Vercel project environment settings for each deployment environment.

## Netlify

Set the Netlify base directory to this app directory (`apps/ego-admin` from a monorepo root). `netlify.toml` runs `npm ci && npm run build`, publishes `dist`, and rewrites client routes to the SPA entry point. Add the required public Vite variables to the Netlify environment settings.

Do not deploy both provider configs against the same production domain unless that is intentional. Preview deployments should use a separate domain/project.

## GitHub Actions

`.github/workflows/build.yml` runs `npm ci` and `npm run build` on pushes and pull requests. GitHub only discovers workflows under the repository's root `.github/workflows` directory. If `ego-admin` is nested inside a larger Git repository, place the workflow at that repository root and set its job working directory to `apps/ego-admin`.

## Routing and Redirects

The SPA fallback is required for direct navigation and refresh on nested routes. It must be a rewrite with HTTP 200, not a redirect to a different path. Static files must still be served normally before the fallback applies.

## Operational Checks

1. Confirm the deployment is building from the `ego-admin` app root.
2. Check the build log for missing Vite variables and resolve configuration errors.
3. Verify `/login`, `/profile`, and `/experience` load directly and survive refresh.
4. Verify reads under the anonymous role and mutations under the intended signed-in account.
5. Inspect Supabase logs when PostgREST returns an RLS or schema error.
6. Keep production and preview Supabase projects separate when testing schema migrations.
