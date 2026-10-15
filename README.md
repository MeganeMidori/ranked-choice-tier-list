This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Database

The app uses Postgres, run locally with Docker. You need [Docker](https://docs.docker.com/get-docker/) installed.

1. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

2. Start the database:

   ```bash
   docker compose up -d
   ```

   Postgres is exposed on port **5433** (not the default 5432), so it won't clash with a Postgres you already have installed. To use a different port, set `POSTGRES_PORT` when you run `docker compose` and update `DATABASE_URL` in `.env.local` to match.

3. Once the dev server is running (next section), check the connection by opening [http://localhost:3000/api/health/db](http://localhost:3000/api/health/db). It should return the database time and Postgres version.

#### Migrations

Migrations are SQL files in `migrations/`, managed by [node-pg-migrate](https://salsita.github.io/node-pg-migrate/). Pending migrations run automatically when the Next.js server starts (via `register()` in `instrumentation.ts`). The server won't serve requests until they finish.

Create a new migration:

```bash
npm run db:migration:create -- create-lists
```

This creates `migrations/<timestamp>_create-lists.sql`. Write the change under `-- Up Migration` and how to undo it under `-- Down Migration`:

```sql
-- Up Migration
create table lists (id serial primary key, name text not null);

-- Down Migration
drop table lists;
```

Each migration runs in its own transaction and is recorded in the `pgmigrations` table. If one fails, it's rolled back and the server won't start.

You can also run migrations without starting the server:

```bash
npm run db:migrate    # apply all pending migrations
npm run db:rollback   # undo the most recent migration
```

Don't edit a migration after it has been applied. Add a new one instead.

Useful commands:

```bash
docker compose stop      # stop the database, keep data
docker compose down -v   # remove the container and delete all data
psql postgres://tierlist:tierlist@localhost:5433/tierlist   # open a SQL shell
```

Server code connects through the shared pool in `lib/db.ts`:

```ts
import { pool } from "@/lib/db";

const { rows } = await pool.query("select * from some_table");
```

### Site password

The whole site, including the API, sits behind a single password set by `SITE_PASSWORD` in `.env.local` (or the host's environment in production). Visitors are sent to `/login` until they enter it, and stay signed in for 30 days through an encrypted [iron-session](https://github.com/vvo/iron-session) cookie.

`SESSION_SECRET` encrypts that cookie and must be at least 32 random characters (`openssl rand -hex 32`). Changing it signs everyone out; changing `SITE_PASSWORD` alone does not. If either isn't set, nobody can get in.

### Dev server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
