/**
 * Install the bilingual starter curriculum into an existing tenant.
 *
 * Usage:
 *   npm run seed:curriculum -- --slug acme
 *   npm run seed:curriculum -- --all        # every tenant
 *
 * Idempotent: existing programs (matched by title) are skipped, so it's safe
 * to re-run after new content is added to src/lib/curriculum.ts.
 */
import { PrismaClient } from "@prisma/client";
import { installCurriculum } from "../src/lib/curriculum-install";

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
    const owner = await withTenant(tenant.id, async (tx) =>
      tx.user.findFirst({ where: { isTenantOwner: true }, select: { id: true } })
    );
    const result = await withTenant(tenant.id, (tx) =>
      installCurriculum(tx, tenant.id, { authorId: owner?.id ?? null })
    );
    console.log(
      `✔ ${tenant.name} (${tenant.slug}): +${result.programsCreated} programs, ` +
        `${result.lessonsCreated} lessons (${result.programsSkipped} already present)`
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
