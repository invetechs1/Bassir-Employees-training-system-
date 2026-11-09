# BCAP — Server Deployment Guide

**Bassir Corporate Academy Platform (BCAP)** — a step-by-step guide for a
developer / DevOps engineer to deploy the system on a production server.

This guide is self-contained. Follow it top to bottom. The **recommended path
is Docker Compose** (Section A) — it brings up the app *and* PostgreSQL with
the correct security settings automatically. A manual (no-Docker) path is in
Section B.

---

## 0. What you are deploying

| | |
|---|---|
| **Stack** | Next.js 15 (App Router) · TypeScript · Prisma 6 · PostgreSQL 16 · Tailwind |
| **Runtime** | Node.js **20+** |
| **Database** | PostgreSQL **16** with **Row-Level Security (RLS)** for multi-tenant isolation |
| **Default port** | `3000` (HTTP) |
| **Health endpoint** | `GET /api/health` → `200` when healthy, `503` when the DB is unreachable |

> **Critical security rule:** the application **must** connect to PostgreSQL as a
> **non-superuser** role (`bcap_app`). Superusers bypass Row-Level Security,
> which would break tenant isolation. The Docker setup does this for you; if you
> deploy manually, do **not** point `DATABASE_URL` at the `postgres` superuser.

---

## 1. Prerequisites

**Server**
- Linux host (Ubuntu 22.04 LTS or similar), 2 vCPU / 4 GB RAM minimum.
- A domain name pointing to the server (e.g. `academy.yourcompany.com`).
- Ports `80`/`443` open to the internet (for the reverse proxy / TLS).

**Software**
- **Docker Engine** + **Docker Compose plugin** (for Path A), or
- **Node.js 20+** and **PostgreSQL 16** (for Path B).

Verify:
```bash
docker --version && docker compose version   # Path A
# or
node --version   # must be >= 20   (Path B)
psql --version   # PostgreSQL 16    (Path B)
```

---

## 2. Get the code

```bash
git clone https://github.com/invetechs1/Bassir-Employees-training-system-.git bcap
cd bcap
# Deploy a released/tested commit or branch:
git checkout main
```

---

# A. Deploy with Docker Compose (recommended)

The repo ships a production `Dockerfile`, `docker-compose.yml`, an entrypoint
that **runs database migrations on boot**, and a Postgres init script that
**creates the non-superuser `bcap_app` role** automatically.

### A.1 Configure secrets and passwords

Edit `docker-compose.yml` and change **all three** of these before going live:

1. **`AUTH_SECRET`** (under the `app` service) — generate a strong value:
   ```bash
   openssl rand -base64 48
   ```
   Paste the output as the `AUTH_SECRET` value.

2. **Database passwords** — change them in **two** places so they match:
   - `docker-compose.yml` → `db` service → `POSTGRES_PASSWORD` (the Postgres
     superuser password, used only for backups).
   - `docker/postgres-init/01-app-role.sql` → the `bcap_app` role password.
   - `docker-compose.yml` → `app` service → `DATABASE_URL` → update the
     `bcap_app:<password>` portion to match the SQL file.

   > The `bcap_app` password lives in **both** `01-app-role.sql` **and**
   > `DATABASE_URL`. They must be identical.

3. **`APP_BASE_URL`** (under the `app` service) — set it to your real public
   URL, e.g. `https://academy.yourcompany.com`. Invitation and reset links are
   built from this value, so it must be correct.

Optional integrations (leave commented out to disable): SMTP e-mail, Stripe
billing, platform console. See Section 4 for the full variable reference.

### A.2 Build and start

```bash
docker compose up -d --build
```

This will:
- start PostgreSQL 16 and create the `bcap_app` non-superuser role,
- build the app image,
- run `prisma migrate deploy` (schema + RLS) on the app's first boot,
- start the app on port `3000`.

Check status and logs:
```bash
docker compose ps
docker compose logs -f app        # watch the app boot & migrate
curl -fsS http://localhost:3000/api/health   # expect: {"ok":true,...}
```

### A.3 Provision your first company (tenant)

The database starts **empty** (no demo data). Create your real company and its
first administrator:

```bash
docker compose exec app npm run provision -- \
  --name "Your Company Ltd." \
  --slug yourco \
  --industry CONSTRUCTION_CONTRACTING \
  --admin-name "Admin Name" \
  --admin-email admin@yourcompany.com \
  --admin-password 'ChooseAStrongPassword1!'
```

- `--slug` is the company's login handle (lowercase letters, numbers, hyphens).
- `--industry` must be one of:
  `ENGINEERING_CONSULTANCY`, `CONSTRUCTION_CONTRACTING`, `LOGISTICS`,
  `MANUFACTURING`, `FINANCE`, `HEALTHCARE`, `TECHNOLOGY`, `RETAIL`, `OTHER`.
- `--admin-password` must be at least 8 characters.

The bilingual (EN/AR) starter curriculum is installed automatically for the
new company.

### A.4 Sign in

Open your site and sign in with the **company slug** (`yourco`) and the admin
e-mail/password you just set. From **People**, invite the rest of the employees.

---

# B. Deploy manually (without Docker)

Use this only if you cannot run Docker. You are responsible for the security
settings the Docker path handles automatically.

### B.1 Create the database and the non-superuser app role

As a Postgres superuser (`psql`):
```sql
CREATE DATABASE bcap;
\c bcap
CREATE ROLE bcap_app WITH LOGIN PASSWORD 'a-strong-app-password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;
GRANT ALL ON DATABASE bcap TO bcap_app;
GRANT CREATE, USAGE ON SCHEMA public TO bcap_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bcap_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bcap_app;
```
(This mirrors `docker/postgres-init/01-app-role.sql`.)

### B.2 Configure environment

```bash
cp .env.example .env
```
Edit `.env` and set at minimum:
- `DATABASE_URL="postgresql://bcap_app:a-strong-app-password@localhost:5432/bcap?schema=public"`
- `AUTH_SECRET="<output of: openssl rand -base64 48>"`
- `APP_BASE_URL="https://academy.yourcompany.com"`

### B.3 Install, migrate, build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy      # applies schema + RLS
npm run build
```

### B.4 Provision the first company

```bash
npm run provision -- \
  --name "Your Company Ltd." --slug yourco \
  --industry CONSTRUCTION_CONTRACTING \
  --admin-name "Admin Name" --admin-email admin@yourcompany.com \
  --admin-password 'ChooseAStrongPassword1!'
```

### B.5 Run the server

```bash
npm start        # starts Next.js on PORT (default 3000)
```
Run it under a process manager so it restarts on crash/reboot — e.g. **PM2**:
```bash
npm install -g pm2
pm2 start "npm start" --name bcap
pm2 save && pm2 startup     # follow the printed command to enable on boot
```

---

## 3. Put it behind HTTPS (both paths)

The app serves plain HTTP on `3000`. In production, terminate TLS with a
reverse proxy (Nginx, Caddy, or a cloud load balancer). Example **Nginx**:

```nginx
server {
    server_name academy.yourcompany.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```
Then issue a certificate (e.g. `certbot --nginx -d academy.yourcompany.com`).

**Important:** once HTTPS is live, make sure `APP_BASE_URL` (and, for Docker,
the value in `docker-compose.yml`) uses the `https://` URL — links in
invitation/reset e-mails are built from it.

---

## 4. Environment variables reference

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string for the **non-superuser** `bcap_app` role. |
| `AUTH_SECRET` | ✅ | Secret that signs session JWTs (HS256). Use `openssl rand -base64 48`. |
| `APP_BASE_URL` | ✅ | Public URL of the app; used to build invitation/reset links. |
| `ROOT_DOMAIN` | ➖ | Root domain for tenant subdomains (e.g. `bcap.app`). Leave as-is for path-based routing. |
| `SESSION_TTL_SECONDS` | ➖ | Session lifetime (default `28800` = 8h). |
| `ENCRYPTION_KEY` | ➖ | Key to encrypt stored secrets at rest; falls back to `AUTH_SECRET`. |
| `APP_VERSION` | ➖ | Version string surfaced by `/api/health` and logs. |
| **E-mail (SMTP)** | ➖ | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Without these, invitations still work — the admin gets a link to share manually. |
| **Stripe billing** | ➖ | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_ENTERPRISE`. Without these, plan changes apply in-app with no payment. |
| **Platform console** | ➖ | `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD` enable the vendor `/platform` console. Leave unset to disable it. |
| **Legal pages** | ➖ | `LEGAL_ENTITY_NAME`, `LEGAL_CONTACT_EMAIL` for the terms/privacy pages. |

See `.env.example` for the annotated master list.

---

## 5. Health checks & monitoring

- **Liveness/readiness:** `GET /api/health`. Returns `200` with
  `{"ok":true,"db":"up",...}` when healthy, `503` with `"db":"down"` when the
  database is unreachable. Point your load balancer / uptime monitor here.
- The Docker images already declare a `HEALTHCHECK` against this endpoint.
- See `docs/OPERATIONS.md` for structured error logging and optional error
  tracking (Sentry) guidance.

---

## 6. Backups & restore

**Never** back up as the `bcap_app` role — RLS would hide rows. Use the Postgres
superuser for dumps.

**Docker (built-in daily backup profile):**
```bash
# Writes daily dumps to ./backups on the host (14-day retention).
docker compose --profile backup up -d
```

**Manual dump / restore** (scripts in `scripts/`):
```bash
# Dump  (BACKUP_DATABASE_URL must use the postgres superuser):
BACKUP_DATABASE_URL="postgresql://postgres:<pw>@localhost:5432/bcap" \
  BACKUP_DIR=/var/backups/bcap ./scripts/backup.sh

# Restore:
BACKUP_DATABASE_URL="postgresql://postgres:<pw>@localhost:5432/bcap" \
  ./scripts/restore.sh /var/backups/bcap/<dump-file>
```
Full DR guidance is in `docs/OPERATIONS.md` (Section 2).

---

## 7. Upgrading to a new version

**Docker:**
```bash
git pull
docker compose up -d --build      # entrypoint runs `prisma migrate deploy` automatically
docker compose logs -f app
```

**Manual:**
```bash
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart bcap                  # or restart your process manager
```
Always take a database backup (Section 6) **before** upgrading.

---

## 8. Post-deployment checklist

- [ ] `AUTH_SECRET` is a fresh random value (not the placeholder).
- [ ] Database passwords changed in **both** the SQL init file and `DATABASE_URL`.
- [ ] App connects as `bcap_app` (**non-superuser**) — RLS is enforced.
- [ ] `APP_BASE_URL` uses your real `https://` domain.
- [ ] HTTPS reverse proxy is in front of port `3000`.
- [ ] `GET /api/health` returns `200`.
- [ ] First company provisioned; admin can sign in with the company slug.
- [ ] (If used) SMTP configured so invitation e-mails are delivered.
- [ ] Automated backups enabled and a test restore verified.
- [ ] Uptime monitor watching `/api/health`.

---

## 9. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `/api/health` returns `503`, `db: down` | App can't reach Postgres. Check `DATABASE_URL`, that the DB container/service is up, and network/firewall. |
| App boots but every page errors after login | Migrations didn't run. Run `npx prisma migrate deploy` (Docker does this on boot — check `docker compose logs app`). |
| Tenants can see each other's data | App is connecting as a **superuser**. It must use the `bcap_app` non-superuser role. |
| Invitation/reset links point to `localhost` | `APP_BASE_URL` is wrong — set it to your public HTTPS URL and restart. |
| `provision` says slug already exists | That company was already created; pick a different `--slug` or sign in to the existing one. |
| Invitation e-mails not arriving | SMTP not configured or wrong credentials. Until fixed, admins can copy the invite link shown in the UI and share it manually. |

---

_For architecture details see `docs/ARCHITECTURE.md`; for day-2 operations see
`docs/OPERATIONS.md`; for the starter curriculum see `docs/CURRICULUM.md`._
