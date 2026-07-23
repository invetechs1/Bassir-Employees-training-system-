-- Runs once, the first time the Postgres data directory is initialised.
-- Creates the NON-SUPERUSER application role that BCAP connects as. This is
-- essential: superuser / BYPASSRLS roles skip Row-Level Security, which would
-- disable tenant isolation.
--
-- Change 'bcap_app_password' here AND in the app's DATABASE_URL before any real
-- deployment.

CREATE ROLE bcap_app WITH LOGIN PASSWORD 'bcap_app_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;

GRANT ALL ON DATABASE bcap TO bcap_app;

-- Let the app role create + own its tables (so RLS FORCE applies to it).
GRANT CREATE, USAGE ON SCHEMA public TO bcap_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bcap_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bcap_app;
