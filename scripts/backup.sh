#!/usr/bin/env bash
#
# BCAP database backup — timestamped, compressed pg_dump with retention.
#
# IMPORTANT: BCAP tables use FORCE ROW LEVEL SECURITY, which blocks pg_dump when
# run as the non-privileged application role (it would produce a SILENTLY
# INCOMPLETE dump). Backups MUST connect as an admin role that bypasses RLS —
# the PostgreSQL superuser, or a dedicated role created WITH BYPASSRLS.
# Provide that connection via BACKUP_DATABASE_URL (falls back to DATABASE_URL).
#
# Usage:
#   BACKUP_DATABASE_URL="postgresql://postgres:pass@host:5432/bcap" \
#   BACKUP_DIR=/var/backups/bcap RETENTION_DAYS=14 ./scripts/backup.sh
#
# Schedule it from cron (e.g. daily at 02:30):
#   30 2 * * * cd /opt/bcap && ./scripts/backup.sh >> /var/log/bcap-backup.log 2>&1
#
set -euo pipefail

# Prefer an explicit admin/BYPASSRLS URL; fall back to DATABASE_URL with a warning.
SRC_URL="${BACKUP_DATABASE_URL:-${DATABASE_URL:-}}"
: "${SRC_URL:?Set BACKUP_DATABASE_URL (admin/BYPASSRLS) or DATABASE_URL}"
if [[ -z "${BACKUP_DATABASE_URL:-}" ]]; then
  echo "[backup] WARNING: BACKUP_DATABASE_URL not set — using DATABASE_URL." >&2
  echo "[backup] WARNING: if this is the app role, RLS-forced tables will be MISSING from the dump." >&2
fi
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Prisma appends a `?schema=` parameter that libpq (pg_dump/psql) rejects.
# Strip it so the standard Postgres tools accept the URL. Default schema is
# `public`, which is what BCAP uses.
PG_URL="$(printf '%s' "$SRC_URL" | sed -E 's/([?&])schema=[^&]*//; s/\?&/?/; s/[?&]$//')"

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/bcap-$STAMP.sql.gz"

echo "[backup] dumping database -> $OUT"
# --no-owner/--no-privileges keep the dump portable across roles (the app role
# is not a superuser). Custom-format is smaller and restorable selectively, but
# plain SQL + gzip is the most portable and easy to inspect.
pg_dump "$PG_URL" --no-owner --no-privileges | gzip -9 > "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo "[backup] wrote $OUT ($SIZE)"

# Retention: delete dumps older than RETENTION_DAYS.
DELETED="$(find "$BACKUP_DIR" -name 'bcap-*.sql.gz' -type f -mtime "+$RETENTION_DAYS" -print -delete | wc -l | tr -d ' ')"
echo "[backup] pruned $DELETED dump(s) older than ${RETENTION_DAYS} days"
echo "[backup] done"
