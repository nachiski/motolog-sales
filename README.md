# MotoLog

MotoLog is a motorcycle sales tracker in Spanish. This branch is the Vercel deployment target and uses Next.js, Google sign-in, Neon Postgres, Drizzle ORM, and minor-unit prices.

## Access model

Users sign in with a Google account. For now, sign-up is open to any Google account with a verified email. Every signed-in user can read, add, edit, and delete all MotoLog sales. The API checks the Auth.js session and same-origin requests for every write. Do not enter sensitive sales data until the intended access policy is set.

## Required environment variables

Set these in the Vercel project before the first production deployment:

- `AUTH_GOOGLE_ID`: OAuth client ID from Google Cloud Console.
- `AUTH_GOOGLE_SECRET`: OAuth client secret from Google Cloud Console.
- `AUTH_SECRET`: a cryptographically random secret (at least 32 characters).
- `DATABASE_URL` or `POSTGRES_URL`: Neon Postgres connection string, injected by the Vercel Marketplace integration.

In Google Cloud Console, add the production callback URL:

```text
https://<your-vercel-domain>/api/auth/callback/google
```

Do not commit OAuth credentials or database URLs. Configure them as encrypted Vercel environment variables.

## Database

The Vercel deployment uses an empty Neon Postgres database. Its schema migration is in `drizzle-pg/` and the Vercel build command applies pending migrations before building. The previous Sites-managed D1 database is left untouched and its sales records are not copied.

To initialize or update a local database after configuring `DATABASE_URL`:

```sh
npm run db:migrate
```

## Develop

Install Node.js 24 and dependencies, configure the required environment variables in `.env.local`, and run:

```sh
npm ci
npm run dev
```

The app requires a reachable Postgres database and Google OAuth credentials for sign-in. Typecheck, lint, tests, and production build can be run with:

```sh
npx tsc --noEmit
npm test
npm run lint
npm run build
```
