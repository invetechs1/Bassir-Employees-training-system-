import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Run a set of queries with the PostgreSQL Row-Level Security tenant context
 * set to `tenantId`. Everything executes inside a single transaction so that
 * `SET LOCAL app.current_tenant` applies to every statement and is
 * automatically cleared when the transaction ends (preventing tenant context
 * from leaking across pooled connections).
 *
 * Usage:
 *   const programs = await withTenant(tenantId, (tx) =>
 *     tx.trainingProgram.findMany()
 *   );
 *
 * Because RLS is enforced in the database, a bug in application code that
 * forgets a `where: { tenantId }` clause still CANNOT read or write another
 * company's rows.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (!tenantId) {
    throw new Error("withTenant called without a tenantId");
  }

  return prisma.$transaction(async (tx) => {
    // set_config(..., true) => transaction-local (LOCAL) setting.
    await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
    return fn(tx);
  });
}
