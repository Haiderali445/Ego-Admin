# Contributing

This app is licensed for personal, non-commercial use. Public redistribution and public contribution submissions are not permitted without prior written permission; see [LICENSE](LICENSE).

For authorized maintainers:

1. Keep domain-specific data access inside `src/services/modules/<domain>/`.
2. Preserve verified PostgreSQL column names and child foreign-key columns.
3. Use TanStack Query for asynchronous server state; use Zustand only for local UI state.
4. Keep the admin app standalone. Do not import from `ego-web` or another app.
5. Never commit `.env`, access tokens, service-role keys, or production credentials.
6. Add or update documentation when routes, schema, deployment, or authorization behavior changes.
7. Run the production build before submitting changes. The current test scripts access the configured Supabase project for read checks; only run them when that access is intended.

```bash
npm ci
npm run build
```
