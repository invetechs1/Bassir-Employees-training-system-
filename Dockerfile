# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# BCAP production image
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS base
WORKDIR /app
# OpenSSL is required by the Prisma engines.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# --- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build ------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runtime ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# App + full node_modules (Prisma CLI is needed at boot for `migrate deploy`).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker/entrypoint.sh"]
