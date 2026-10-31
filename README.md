# MotoLog

Private motorcycle sales tracker in Latin American Spanish, with monthly totals by brand and location, searchable sales records, CSV export, and a saved light/dark appearance preference.

Live application: https://motolog-sales-mvu8s2ht.tangymoth18.chatgpt.site/

## Technology

- React and TypeScript, using Vinext's Next.js-compatible application structure
- Cloudflare Workers for the backend
- Cloudflare D1 (SQLite) for durable sales records
- Drizzle ORM and versioned SQL migrations
- Sites hosting with platform-managed ChatGPT sign-in and private access

## Develop on Linux

Install Git and Node.js 24 with npm. Clone this private repository using the URL shown by GitHub's **Code** button, then open a terminal in the cloned folder.

Install the exact dependencies and build the app:

```sh
npm ci
npm run build
```

Initialize the separate local development database once:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clear_winter_soldier.sql
```

Start the development server:

```sh
npm run dev
```

Open the local URL printed by the server (normally http://localhost:5173).

For a preview of a production build, use `npm start` after `npm run build`.

A clean clone defaults to the portable execution profile on Linux. No Codex installation or Windows-only path is needed for these npm commands.

## Databases and access

The repository contains application code and schema migrations, not the live sales records. Local development starts with its own empty database. The existing hosted application continues using its existing production D1 database and private access policy.

Local preview is for development and uses the starter's local authentication simulation. The hosted ChatGPT login/access gate is supplied by Sites; copying this code to another hosting service does not copy that gate or production database. Keep development previews on localhost.

GitHub stores the source code. It does not automatically move or redeploy the existing hosted application. Use the live application link above to access the existing sales records from Linux.

## Project structure

- `app/page.tsx`: dashboard, sales form, filters, CSV export, and theme switch
- `app/globals.css`: responsive styles and dark mode
- `app/api/sales/route.ts`: sales API and validation
- `lib/motorcycle-brands.ts`: allowed brands and locations
- `db/schema.ts`: sales table definition
- `drizzle/`: database schema migrations
- `worker/`: Cloudflare Workers entry point
- `.openai/hosting.json`: existing Sites project identity and logical database binding

## Development checks

```sh
npx tsc --noEmit
npm run build
```

When adding database fields, generate a new migration using `npm run db:generate`. Apply new migrations to the local database in order; do not replay already applied migrations or modify applied migration history.

The repository excludes dependencies, build output, credentials, local database state, and temporary files through `.gitignore`.
