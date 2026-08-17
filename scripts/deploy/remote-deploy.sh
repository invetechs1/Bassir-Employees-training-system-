#!/bin/sh
# Deploys the bcap app image on this Docker host.
# Only touches resources prefixed "bcap386074-" (containers, network) and the
# "bcap386074:latest" image — nothing else on the host is modified.
#
# NOTE ON NAMING: this host is a shared sandbox running many unrelated
# projects. An earlier deploy of this app used the plain "bcap-*" names and
# was silently overwritten by a different, unrelated project that happened to
# pick the exact same names (container, network, and database "bcap" all got
# reused, wiping our data). The "386074" suffix is a random per-deployment
# id specifically to avoid that colliding again — do not shorten it back to
# plain "bcap-*".
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

NETWORK="bcap386074-net"
DB_CONTAINER="bcap386074-db"
DB_VOLUME="bcap386074-db-data"
APP_CONTAINER="bcap386074-app"
IMAGE="bcap386074:latest"

if [ ! -f "$DIR/.env" ]; then
  echo "✗ Missing $DIR/.env — copy scripts/deploy/.env.remote there first." >&2
  exit 1
fi
# shellcheck disable=SC1091
. "$DIR/.env"

echo "→ Removing existing ${APP_CONTAINER} container (if any)…"
docker rm -f "$APP_CONTAINER" >/dev/null 2>&1 || true

echo "→ Removing existing ${IMAGE} image (if any)…"
docker rmi -f "$IMAGE" >/dev/null 2>&1 || true

echo "→ Loading new image from bcap386074.tar…"
docker load -i "$DIR/bcap386074.tar"

echo "→ Ensuring network ${NETWORK} exists…"
docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK" >/dev/null

if ! docker inspect "$DB_CONTAINER" >/dev/null 2>&1; then
  echo "→ Creating ${DB_CONTAINER} (first deploy only — left running on future deploys)…"
  docker volume create "$DB_VOLUME" >/dev/null
  # postgres-init/01-app-role.sql (password pre-substituted) creates the
  # non-superuser bcap_app role with the correct RLS-safe grants — same
  # script used by local docker-compose. It only runs once, when the data
  # directory is first initialised.
  docker run -d \
    --name "$DB_CONTAINER" \
    --network "$NETWORK" \
    --restart unless-stopped \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD="$POSTGRES_SUPERUSER_PASSWORD" \
    -e POSTGRES_DB=bcap \
    -v "$DB_VOLUME:/var/lib/postgresql/data" \
    -v "$DIR/postgres-init:/docker-entrypoint-initdb.d:ro" \
    postgres:16 >/dev/null
else
  echo "→ ${DB_CONTAINER} already exists, leaving it running untouched."
  docker start "$DB_CONTAINER" >/dev/null 2>&1 || true
fi

echo "→ Waiting for ${DB_CONTAINER} to become healthy…"
for i in $(seq 1 30); do
  if docker exec "$DB_CONTAINER" pg_isready -U postgres -d bcap >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "→ Starting ${APP_CONTAINER}…"
docker run -d \
  --name "$APP_CONTAINER" \
  --network "$NETWORK" \
  --restart unless-stopped \
  --env-file "$DIR/.env" \
  -e DATABASE_URL="postgresql://bcap_app:${BCAP_APP_DB_PASSWORD}@${DB_CONTAINER}:5432/bcap?schema=public" \
  -p 3860:3000 \
  "$IMAGE" >/dev/null

echo "→ Done. ${APP_CONTAINER} is starting; it applies DB migrations on boot."
docker ps --filter "name=bcap386074-"
