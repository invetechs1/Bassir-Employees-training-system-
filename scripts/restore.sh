#!/usr/bin/env bash
#
# BCAP database restore from a backup produced by scripts/backup.sh.
#
# Like backups, restore must run as an admin role that bypasses RLS (superuser
# or a role created WITH BYPASSRLS) — the app role would be blocked by
# FORCE ROW LEVEL SECURITY when loading rows. Provide it via
# BACKUP_DATABASE_URL (falls back to DATABASE_URL).
#
# Usage:
#   BACKUP_DATABASE_URL="postgresql://postgres:pass@host:5432/bcap_restore" \
#   ./scripts/restore.sh /var/backups/bcap/bcap-20260101T000000Z.sql.gz
#
# WARNING: this restores INTO the target database. Restore into a fresh/empty
# database (or a staging one) unless you intend to overwrite. Row-Level
# Security policies are part of the dump, so they come back with the data.
#
set -euo pipefail

SRC_URL="${BACKUP_DATABASE_URL:-${DATABASE_URL:-}}"
: "${SRC_URL:?Set BACKUP_DATABASE_URL (admin/BYPASSRLS) or DATABASE_URL}"
DUMP="${1:-}"
if [[ -z "$DUMP" || ! -f "$DUMP" ]]; then
  echo "usage: $0 <path-to-bcap-*.sql.gz>" >&2
  exit 2
fi

# Prisma appends a `?schema=` parameter that libpq (psql) rejects — strip it.
PG_URL="$(printf '%s' "$SRC_URL" | sed -E 's/([?&])schema=[^&]*//; s/\?&/?/; s/[?&]$//')"

echo "[restore] restoring $DUMP -> target database"
echo "[restore] NOTE: run against an empty/staging database to avoid overwriting live data."

# psql applies the plain-SQL dump. ON_ERROR_STOP surfaces failures instead of
# silently continuing.
gunzip -c "$DUMP" | psql "$PG_URL" -v ON_ERROR_STOP=1

echo "[restore] done. Verify with: psql \"\$DATABASE_URL\" -c 'SELECT count(*) FROM tenants;'"
