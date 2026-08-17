#!/bin/sh
# Builds the BCAP production image and packages it as a tar for transfer to
# a remote Docker host. Run from the repository root.
set -e

# NOTE: tagged with a per-deployment suffix (not plain "bcap") because the
# target remote host is a shared sandbox where a previous deploy using the
# plain "bcap" name got silently overwritten by an unrelated project that
# picked the same name. Keep this in sync with scripts/deploy/remote-deploy.sh.
IMAGE_NAME="bcap386074"
IMAGE_TAG="latest"
OUT_DIR="$(dirname "$0")/../../dist"
OUT_FILE="$OUT_DIR/${IMAGE_NAME}.tar"

echo "→ Removing existing local image ${IMAGE_NAME}:${IMAGE_TAG} (if present)…"
docker rmi -f "${IMAGE_NAME}:${IMAGE_TAG}" 2>/dev/null || true

echo "→ Building ${IMAGE_NAME}:${IMAGE_TAG}…"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

mkdir -p "$OUT_DIR"
echo "→ Saving image to ${OUT_FILE}…"
docker save -o "$OUT_FILE" "${IMAGE_NAME}:${IMAGE_TAG}"

echo "→ Done: $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"
