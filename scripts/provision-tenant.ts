/**
 * Provision a real company (tenant) and its first administrator.
 *
 * Usage:
 *   npm run provision -- \
 *     --name "Acme Contracting" \
 *     --slug acme \
 *     --industry CONSTRUCTION_CONTRACTING \
 *     --admin-name "Sara Admin" \
 *     --admin-email admin@acme.com \
 *     --admin-password 'Str0ngPass!'
 *
 * Creates the tenant, seeds the global permission catalog, clones the four
 * system roles into the tenant, and creates the owner/administrator account.
 * Unlike `db:seed`, it adds NO demo employees, programs or ratings — it is the
 * clean way to stand up a brand-new customer in production.
 */
import { PrismaClient, type Industry } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, SYSTEM_ROLES } from "../src/lib/rbac";
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

const VALID_INDUSTRIES: Industry[] = [
  "ENGINEERING_CONSULTANCY",
  "CONSTRUCTION_CONTRACTING",
  "LOGISTICS",
  "MANUFACTURING",
  "FINANCE",
  "HEALTHCARE",
  "TECHNOLOGY",
  "RETAIL",
  "OTHER",
];

async function main() {
  const name = arg("name");
  const slug = arg("slug")?.toLowerCase();
  const industryRaw = (arg("industry") ?? "OTHER").toUpperCase();
  const adminName = arg("admin-name") ?? "Administrator";
  const adminEmail = arg("admin-email")?.toLowerCase();
  const adminPassword = arg("admin-password");

  const problems: string[] = [];
  if (!name) problems.push("--name is required");
  if (!slug || !/^[a-z0-9-]{2,40}$/.test(slug))
    problems.push("--slug is required (lowercase letters, numbers, hyphens)");
  if (!adminEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail))
    problems.push("--admin-email must be a valid email");
  if (!adminPassword || adminPassword.length < 8)
    problems.push("--admin-password must be at least 8 characters");
  const industry = (VALID_INDUSTRIES as string[]).includes(industryRaw)
    ? (industryRaw as Industry)
    : "OTHER";

  if (problems.length) {
    console.error("Cannot provision tenant:\n  - " + problems.join("\n  - "));
    process.exit(1);
  }

  const existing = await prisma.tenant.findUnique({ where: { slug: slug! } });
  if (existing) {
    console.error(`A company with slug "${slug}" already exists.`);
    process.exit(1);
  }

  // Ensure the global permission catalog exists.
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      create: { key, description, category: key.split(".")[0] },
      update: { description },
    });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: name!,
      slug: slug!,
      industry,
      status: "ACTIVE",
      plan: "GROWTH",
    },
  });

  const [firstName, ...rest] = adminName.split(" ");
  const lastName = rest.join(" ") || "Admin";
  const passwordHash = await bcrypt.hash(adminPassword!, 12);

  await withTenant(tenant.id, async (tx) => {
    const roleByKey: Record<string, string> = {};
    for (const [key, def] of Object.entries(SYSTEM_ROLES)) {
      const role = await tx.role.create({
        data: {
          tenantId: tenant.id,
          key,
          name: def.name,
          description: def.description,
          isSystem: true,
        },
      });
      roleByKey[key] = role.id;
      const perms = await tx.permission.findMany({
        where: { key: { in: [...def.permissions] } },
      });
      await tx.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }

    const owner = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: adminEmail!,
        passwordHash,
        firstName,
        lastName,
        jobTitle: "Administrator",
        isTenantOwner: true,
        status: "ACTIVE",
      },
    });
    await tx.userRole.create({
      data: { userId: owner.id, roleId: roleByKey.admin },
    });

    // Ship the bilingual starter curriculum unless explicitly skipped, so the
    // company has ready-made courses (Accounting, HR, PM, Executive) at launch.
    if (!process.argv.includes("--no-curriculum")) {
      const installed = await installCurriculum(tx, tenant.id, {
        authorId: owner.id,
      });
      console.log(
        `  Curriculum: ${installed.programsCreated} programs, ${installed.lessonsCreated} lessons installed.`
      );
    }
  });

  console.log("\n✅ Company provisioned.\n");
  console.log(`  Company:  ${name}`);
  console.log(`  Login slug: ${slug}`);
  console.log(`  Admin:    ${adminEmail}`);
  console.log(`\nSign in at /login with company "${slug}" and the admin email above.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
