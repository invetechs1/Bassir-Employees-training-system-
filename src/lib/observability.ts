/**
 * Minimal, dependency-free error/observability seam.
 *
 * `captureError` always emits a single structured JSON line to stderr, which
 * any log aggregator (CloudWatch, Loki, Datadog, Sentry's log ingestion, …)
 * can pick up. To forward to a dedicated error tracker, install its SDK and
 * call it from the marked hook below — see docs/OPERATIONS.md. Keeping this
 * behind one function means call sites never change when you add a provider.
 */

export interface ErrorContext {
  where?: string;
  tenantId?: string;
  userId?: string;
  [key: string]: unknown;
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

/** Record a handled error. Never throws. */
export function captureError(err: unknown, context: ErrorContext = {}): void {
  try {
    const payload = {
      level: "error",
      timestamp: new Date().toISOString(),
      service: "bcap",
      version: process.env.APP_VERSION ?? "dev",
      error: serializeError(err),
      ...context,
    };
    // Structured log line — consumable by any aggregator.
    console.error("[bcap:error] " + JSON.stringify(payload));

    // --- error-tracker hook -------------------------------------------------
    // If you add an SDK (e.g. @sentry/nextjs), forward here when configured:
    //   if (process.env.SENTRY_DSN) Sentry.captureException(err, { extra: context });
    // Left out by default so the app has zero extra runtime dependencies.
  } catch {
    // Observability must never break the request path.
  }
}
