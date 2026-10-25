# BCAP — Operations Guide

Practical runbook for running BCAP in production: health checks, backups &
disaster recovery, and monitoring/error tracking. Pairs with `README.md`
(setup) and `docs/ARCHITECTURE.md` (design).

---

## 1. Health checks

The app exposes **`GET /api/health`** — a liveness/readiness probe that also
verifies database connectivity.

- Returns **`200`** with `{"ok":true,"status":"ok","db":"up",...}` when healthy.
- Returns **`503`** with `"db":"down"` when the database is unreachable.
- Also reports `uptimeSeconds`, `version` (from `APP_VERSION`), and a timestamp.

```bash
curl -s http://localhost:3000/api/health | jq
```

Wire it into:
- **Load balancers / reverse proxies** — use `/api/health` as the health path.
- **Uptime monitors** (UptimeRobot, Pingdom, Better Stack) — alert on non-200.
- **Containers** — the `Dockerfile` `HEALTHCHECK` and the Compose `healthcheck`
  already call this endpoint, so `docker ps` shows `healthy`/`unhealthy`.

---

## 2. Backups & disaster recovery

### What to back up
The **PostgreSQL database** is the only stateful component — it holds every
tenant's data. The app itself is stateless (rebuilt from the image).

### Taking backups
`scripts/backup.sh` produces a timestamped, gzipped `pg_dump` and prunes old
dumps.

> **Important — use an admin connection.** BCAP tables use `FORCE ROW LEVEL
> SECURITY`. If you run `pg_dump` as the **application role**, RLS blocks the
> row reads and you get a **silently incomplete dump**. Backups (and restores)
> must connect as the **PostgreSQL superuser** or a role created
> `WITH BYPASSRLS`. Provide that via `BACKUP_DATABASE_URL`.

```bash
BACKUP_DATABASE_URL="postgresql://postgres:pass@host:5432/bcap" \
BACKUP_DIR=/var/backups/bcap RETENTION_DAYS=14 \
./scripts/backup.sh
```

Schedule it daily via cron:
```cron
30 2 * * * cd /opt/bcap && ./scripts/backup.sh >> /var/log/bcap-backup.log 2>&1
```

Or run the bundled Compose service (writes to `./backups`, daily, 14-day
retention):
```bash
docker compose --profile backup up -d backup
```

### Restoring
Restore **into an empty or staging database** first to verify, then cut over:

```bash
BACKUP_DATABASE_URL="postgresql://postgres:pass@host:5432/bcap_restore" \
./scripts/restore.sh /var/backups/bcap/bcap-20260101T023000Z.sql.gz
```

RLS policies are included in the dump, so they return with the data. After a
restore, confirm the app connects as the **non-superuser** role (see README) so
RLS stays enforced.

### DR recommendations
- **Off-host copies:** sync `BACKUP_DIR` to object storage (S3 and equivalents)
  so a lost host doesn't lose backups. Enable server-side encryption.
- **Managed Postgres:** if you use a managed database (recommended), also enable
  its **point-in-time recovery (PITR)** / automated snapshots — `backup.sh` is
  then your portable, provider-independent second line.
- **Test restores** on a schedule (e.g. monthly) — an untested backup is not a
  backup. Track **RPO** (max acceptable data loss → backup frequency) and
  **RTO** (max acceptable downtime → restore drill time).
- **Secrets:** back up `.env` / secret material separately and securely; it is
  not in the database dump.

---

## 3. Monitoring & error tracking

### Structured error logging (built in)
`src/lib/observability.ts` exposes `captureError(err, context)`, which emits a
single structured JSON line to stderr:

```json
{"level":"error","timestamp":"…","service":"bcap","version":"1.0.0","error":{…},"where":"…"}
```

Any log aggregator (CloudWatch, Loki, Datadog, Better Stack, or Sentry's
log ingestion) can collect these. Set `APP_VERSION` so errors are attributable
to a release.

### Adding a dedicated error tracker (optional)
To forward exceptions to Sentry (or similar):
1. `npm install @sentry/nextjs` and run its wizard (adds client/server config).
2. In `src/lib/observability.ts`, at the marked hook, call
   `Sentry.captureException(err, { extra: context })` when `SENTRY_DSN` is set.
3. Set `SENTRY_DSN` in the environment.

Because every handled error already routes through `captureError`, no call
sites change when you add a provider.

### What to watch
- **Uptime**: `/api/health` non-200.
- **Errors**: rate of `[bcap:error]` log lines; spikes after a deploy.
- **Database**: connections, slow queries, disk usage, replication lag (managed
  dashboards or `pg_stat_*`).
- **Resources**: app container CPU/memory; PostgreSQL disk headroom.
- **Certificates & domains**: TLS expiry on your public URL.

---

## 4. Deploy checklist (quick)

- [ ] Strong `AUTH_SECRET` (32+ chars) and rotated DB passwords.
- [ ] App connects as the **non-superuser** DB role (RLS enforced).
- [ ] `APP_BASE_URL` set to the real public URL (invite/reset links).
- [ ] `/api/health` reachable by your load balancer / monitor.
- [ ] Automated **backups** scheduled + **one test restore** completed.
- [ ] Log/error aggregation receiving `[bcap:error]` lines.
- [ ] Optional integrations configured as needed (SMTP, Stripe, SSO).
