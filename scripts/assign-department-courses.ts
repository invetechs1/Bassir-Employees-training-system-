/**
 * Backfill department-based course auto-assignment for existing employees.
 * Enrolls every active member of every mapped department into that
 * department's training track. Idempotent.
 *
 * Usage:
 *   npm run assign:department-courses -- --slug acme
 *   npm run assign:department-courses -- --all
 */
import { PrismaClient } from "@prisma/client";
import { assignDepartmentMembers } from "../src/lib/assign";

const prisma = new PrismaClient();

function withTenant<T>(
  tenantId: string,
  fn: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
    return fn(tx);
  });
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const all = process.argv.includes("--all");
  const slug = arg("slug")?.toLowerCase();
  if (!all && !slug) {
    console.error("Provide --slug <company> or --all");
    process.exit(1);
  }

  const tenants = all
    ? await prisma.tenant.findMany()
    : await prisma.tenant.findMany({ where: { slug } });
  if (tenants.length === 0) {
    console.error(slug ? `No company with slug "${slug}".` : "No tenants found.");
    process.exit(1);
  }

  for (const tenant of tenants) {
    const result = await withTenant(tenant.id, async (tx) => {
      const departments = await tx.department.findMany({
        where: { trainingCategory: { not: null } },
        select: { id: true },
      });
      let users = 0;
      let enrollments = 0;
      for (const d of departments) {
        const r = await assignDepartmentMembers(tx, tenant.id, d.id);
        users += r.users;
        enrollments += r.enrollments;
      }
      return { departments: departments.length, users, enrollments };
    });
    console.log(
      `✔ ${tenant.name} (${tenant.slug}): ${result.departments} mapped dept(s), ` +
        `+${result.enrollments} new enrollment(s) across ${result.users} member(s)`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
