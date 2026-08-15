#!/bin/sh
set -e

echo "→ Applying database migrations (schema + Row-Level Security)…"
npx prisma migrate deploy

echo "→ Starting BCAP on port ${PORT:-3000}…"
exec node_modules/.bin/next start -p "${PORT:-3000}"
