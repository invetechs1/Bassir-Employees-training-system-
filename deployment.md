# BCAP — Docker Build & Remote Deployment

This document describes how the **bcap** (Bassir Corporate Academy Platform) app
image is built, packaged, and deployed to the remote Docker host.

## Naming collision incident (read this first)

The first deployment used plain names (`bcap-app`, `bcap-db`, `bcap-net`,
`bcap:latest`, database `bcap`). `13.140.138.252` is a **shared sandbox**
running dozens of unrelated projects, and a different, unrelated project's
deploy pipeline independently picked the *exact same* names. Its Prisma
migration ran against our live `bcap-db` container and wiped our schema,
replacing it with its own ("Bassir Social Pro", a social-media tool — visible
via `docker exec bcap-app cat package.json`). The original admin account and
data were lost as a result. The `bcap-app`/`bcap-db`/`bcap-net`/`bcap:latest`
resources are now genuinely owned by that other project — **do not remove or
reuse them**, they are live infrastructure for someone else's app now.

The fix: every resource name for this project now carries a random
per-deployment suffix, `386074`, that no other project on this shared host is
plausibly also using. Do not rename these back to plain `bcap-*` — that's
exactly what caused the incident.

- Local/remote image name: `bcap386074:latest`
- Remote project folder: `/opt/bcap386074`
- Remote containers: `bcap386074-app` (this project) + `bcap386074-db`
  (PostgreSQL, created once and left alone on redeploys)
- Remote network: `bcap386074-net`
- Remote host port: `3860` → container port `3000`

Only resources prefixed `bcap386074-` (plus the `bcap386074:latest` image) are
ever created, replaced, or removed by this process. Nothing else on the
remote host — including the now-unrelated old `bcap-*` resources — is
touched.

## 1. Build the image locally

From the repository root:

```sh
# Remove any existing local image for this project, then rebuild from scratch.
docker rmi -f bcap386074:latest 2>/dev/null || true
docker build -t bcap386074:latest .
```

Or simply run the helper script, which does the same two steps plus the tar
export from step 2:

```sh
sh scripts/deploy/package.sh
```

## 2. Export the image to a tar file

```sh
mkdir -p dist
docker save -o dist/bcap386074.tar bcap386074:latest
```

## 3. Copy the tar (and deploy script) to the remote server

```sh
ssh root@13.140.138.252 "mkdir -p /opt/bcap386074/postgres-init"
scp dist/bcap386074.tar                  root@13.140.138.252:/opt/bcap386074/bcap386074.tar
scp scripts/deploy/remote-deploy.sh      root@13.140.138.252:/opt/bcap386074/deploy.sh
scp docker/postgres-init/01-app-role.sql root@13.140.138.252:/opt/bcap386074/postgres-init/01-app-role.sql  # first deploy only
scp scripts/deploy/.env.remote           root@13.140.138.252:/opt/bcap386074/.env                          # first deploy only — see below
ssh root@13.140.138.252 "chmod +x /opt/bcap386074/deploy.sh"
```

`.env` holds runtime secrets (`AUTH_SECRET`, DB passwords, `APP_BASE_URL`). It,
and `postgres-init/01-app-role.sql` (with the matching DB password already
substituted in), are generated **once on first deploy** and then left in place
on the server for all future deploys — only `bcap386074.tar` and `deploy.sh`
are overwritten on redeploy.

## 4. Deploy on the remote server

```sh
ssh root@13.140.138.252 "/opt/bcap386074/deploy.sh"
```

`/opt/bcap386074/deploy.sh` (see [scripts/deploy/remote-deploy.sh](scripts/deploy/remote-deploy.sh)
for the source of truth) does, in order:

1. Stops and removes the existing `bcap386074-app` container, if any.
2. Removes the existing `bcap386074:latest` image, if any.
3. Loads the new image: `docker load -i /opt/bcap386074/bcap386074.tar`.
4. Ensures the `bcap386074-net` network exists (creates it if missing).
5. Ensures the `bcap386074-db` Postgres container exists and is running. It
   is only **created** the first time — on redeploys it is left running
   untouched, so application data persists across deploys. On creation, it
   mounts `postgres-init/01-app-role.sql` (same init script used by local
   `docker-compose.yml`) to create the non-superuser `bcap_app` role that RLS
   tenant isolation depends on.
6. Waits for Postgres to report healthy.
7. Starts the new `bcap386074-app` container (env vars from
   `/opt/bcap386074/.env`, host port `3860` → container port `3000`,
   `--restart unless-stopped`). The container runs `prisma migrate deploy`
   automatically on boot before serving traffic.

No other container or image on the host is stopped, removed, or modified.

## 5. Verify

```sh
curl -I http://13.140.138.252:3860/login
ssh root@13.140.138.252 "docker ps --filter name=bcap386074-"
# Confirm it's actually our app, not a collision:
ssh root@13.140.138.252 "docker exec bcap386074-app cat package.json | head -3"
```

## Redeploying after a code change

Repeat steps 1–2 and step 4 (the tar/script copy in step 3 minus the `.env`
line, since `.env` already exists on the server):

```sh
sh scripts/deploy/package.sh
scp dist/bcap386074.tar             root@13.140.138.252:/opt/bcap386074/bcap386074.tar
scp scripts/deploy/remote-deploy.sh root@13.140.138.252:/opt/bcap386074/deploy.sh
ssh root@13.140.138.252 "chmod +x /opt/bcap386074/deploy.sh && /opt/bcap386074/deploy.sh"
```

This only rebuilds/replaces the `bcap386074-app` container and
`bcap386074:latest` image. The `bcap386074-db` container and its data volume
(`bcap386074-db-data`) are left running.

After any redeploy, always re-check that no other project on the shared host
has collided with these names (step 5's `cat package.json` check) before
trusting the deployment.

## Notes / follow-ups

- `AUTH_SECRET` and the Postgres password in `/opt/bcap386074/.env` are
  generated randomly on first deploy — back that file up if you need to
  reproduce the environment elsewhere.
- `APP_BASE_URL` in `.env` is set to `http://13.140.138.252:3860`. Update it
  (and re-run `deploy.sh`) if you point a domain at this host.
- Port `3860` must be reachable through any cloud firewall / security group in
  front of `13.140.138.252` for external access to work.
- The SSH root password was shared in plaintext for this task. Rotate it
  (`passwd` on the server) and switch to key-based auth once deployment access
  is no longer needed via password.
- This host is shared with many unrelated projects with no apparent
  namespacing convention. Consider asking whoever administers it to either
  give this project its own VM/container host, or agree on a per-project
  naming prefix so this doesn't happen again.
