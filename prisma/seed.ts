/**
 * BCAP seed — provisions the permission catalog and the three initial tenants:
 *   1. Alarrab Engineering Consultancy
 *   2. Azoom United Contracting
 *   3. Hadathah Logistics
 *
 * Each tenant gets: branches, departments, the four system roles (with their
 * permission grants), an owner/admin, sample employees, competencies and a
 * couple of published training programs.
 *
 * Default password for every seeded user: "Password123!"
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient, type Industry } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, SYSTEM_ROLES, type SystemRoleKey } from "../src/lib/rbac";

const prisma = new PrismaClient();

// Local copy of the tenant-scoping helper (seed can't import Next server modules).
async function withTenant<T>(
  tenantId: string,
  fn: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
    return fn(tx);
  });
}

interface TenantSpec {
  name: string;
  slug: string;
  industry: Industry;
  branch: { name: string; city: string };
  departments: string[];
  competencies: string[];
  programs: {
    title: string;
    description: string;
    level: "FOUNDATION" | "INTERMEDIATE" | "ADVANCED" | "LEADERSHIP";
    durationHours: number;
  }[];
}

const TENANTS: TenantSpec[] = [
  {
    name: "Alarrab Engineering Consultancy",
    slug: "alarrab",
    industry: "ENGINEERING_CONSULTANCY",
    branch: { name: "Riyadh HQ", city: "Riyadh" },
    departments: ["Structural Engineering", "MEP", "Project Management"],
    competencies: [
      "Structural Design",
      "BIM & Coordination",
      "Client Management",
      "Engineering Leadership",
    ],
    programs: [
      {
        title: "Structural Design Fundamentals",
        description:
          "Core principles of structural analysis and design for junior engineers.",
        level: "FOUNDATION",
        durationHours: 24,
      },
      {
        title: "Leading Engineering Teams",
        description:
          "Develop the leadership capability to run multidisciplinary project teams.",
        level: "LEADERSHIP",
        durationHours: 16,
      },
    ],
  },
  {
    name: "Azoom United Contracting",
    slug: "azoom",
    industry: "CONSTRUCTION_CONTRACTING",
    branch: { name: "Jeddah Operations", city: "Jeddah" },
    departments: ["Site Operations", "HSE", "Procurement"],
    competencies: [
      "Site Safety",
      "Project Controls",
      "Quality Management",
      "Site Leadership",
    ],
    programs: [
      {
        title: "Construction Site Safety Essentials",
        description:
          "HSE fundamentals every site worker and supervisor must master.",
        level: "FOUNDATION",
        durationHours: 12,
      },
      {
        title: "Advanced Project Controls",
        description:
          "Cost, schedule and earned-value management for large contracts.",
        level: "ADVANCED",
        durationHours: 20,
      },
    ],
  },
  {
    name: "Hadathah Logistics",
    slug: "hadathah",
    industry: "LOGISTICS",
    branch: { name: "Dammam Hub", city: "Dammam" },
    departments: ["Warehousing", "Fleet", "Supply Chain"],
    competencies: [
      "Warehouse Operations",
      "Fleet Optimization",
      "Supply Chain Planning",
      "Operations Leadership",
    ],
    programs: [
      {
        title: "Warehouse Operations Excellence",
        description:
          "Lean, safe and efficient warehouse operations from receiving to dispatch.",
        level: "FOUNDATION",
        durationHours: 14,
      },
      {
        title: "Supply Chain Analytics",
        description:
          "Use data to optimize inventory, routing and demand planning.",
        level: "INTERMEDIATE",
        durationHours: 18,
      },
    ],
  },
];

async function seedPermissions() {
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      create: { key, description, category: key.split(".")[0] },
      update: { description, category: key.split(".")[0] },
    });
  }
  console.log(`✔ Seeded ${Object.keys(PERMISSIONS).length} permissions`);
}

async function seedTenant(spec: TenantSpec, passwordHash: string) {
  const tenant = await prisma.tenant.upsert({
    where: { slug: spec.slug },
    create: {
      name: spec.name,
      slug: spec.slug,
      industry: spec.industry,
      status: "ACTIVE",
      plan: "ENTERPRISE",
    },
    update: { name: spec.name, industry: spec.industry },
  });

  await withTenant(tenant.id, async (tx) => {
    // Branch + departments
    const branch = await tx.branch.create({
      data: { tenantId: tenant.id, name: spec.branch.name, city: spec.branch.city },
    });
    const departments = await Promise.all(
      spec.departments.map((name) =>
        tx.department.create({
          data: { tenantId: tenant.id, name, branchId: branch.id },
        })
      )
    );

    // Roles + permission grants
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

    // Competencies
    const category = await tx.competencyCategory.create({
      data: { tenantId: tenant.id, name: "Core" },
    });
    await tx.competency.createMany({
      data: spec.competencies.map((name) => ({
        tenantId: tenant.id,
        categoryId: category.id,
        name,
      })),
    });

    // Users
    async function makeUser(
      firstName: string,
      lastName: string,
      roleKey: SystemRoleKey,
      opts: { owner?: boolean; jobTitle?: string; deptIndex?: number } = {}
    ) {
      const email = `${firstName.toLowerCase()}@${spec.slug}.bcap`;
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash,
          firstName,
          lastName,
          jobTitle: opts.jobTitle,
          isTenantOwner: opts.owner ?? false,
          departmentId:
            opts.deptIndex !== undefined ? departments[opts.deptIndex]?.id : null,
          branchId: branch.id,
        },
      });
      await tx.userRole.create({
        data: { userId: user.id, roleId: roleByKey[roleKey] },
      });
      return user;
    }

    await makeUser("Admin", spec.name.split(" ")[0], "admin", {
      owner: true,
      jobTitle: "Platform Administrator",
    });
    await makeUser("Huda", "Al-Otaibi", "hr_manager", {
      jobTitle: "L&D Manager",
      deptIndex: 0,
    });
    await makeUser("Faisal", "Al-Harbi", "manager", {
      jobTitle: "Department Manager",
      deptIndex: 1,
    });
    const learner1 = await makeUser("Sara", "Al-Qahtani", "learner", {
      jobTitle: "Engineer",
      deptIndex: 0,
    });
    await makeUser("Omar", "Al-Ghamdi", "learner", {
      jobTitle: "Specialist",
      deptIndex: 2,
    });

    // Programs (published) + one sample enrollment
    const createdPrograms = [];
    for (const p of spec.programs) {
      const program = await tx.trainingProgram.create({
        data: {
          tenantId: tenant.id,
          title: p.title,
          description: p.description,
          level: p.level,
          durationHours: p.durationHours,
          status: "PUBLISHED",
        },
      });
      createdPrograms.push(program);
    }
    if (createdPrograms[0]) {
      await tx.enrollment.create({
        data: {
          tenantId: tenant.id,
          programId: createdPrograms[0].id,
          userId: learner1.id,
          status: "IN_PROGRESS",
          progress: 50,
        },
      });
    }
  });

  console.log(`✔ Seeded tenant: ${spec.name} (${spec.slug})`);
}

async function main() {
  console.log("Seeding BCAP…");
  await seedPermissions();

  const passwordHash = await bcrypt.hash("Password123!", 12);
  for (const spec of TENANTS) {
    await seedTenant(spec, passwordHash);
  }

  console.log("\nDone. Sample logins (password: Password123!):");
  for (const t of TENANTS) {
    console.log(`  company=${t.slug}  email=admin@${t.slug}.bcap  (admin)`);
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
