/**
 * Training due-date reminders.
 *
 * Finds assigned courses that are due soon or overdue and emails the employee a
 * single digest of what they owe. A per-enrollment `reminderSentAt` throttles
 * repeats so nobody is spammed. Designed to be run on a schedule (e.g. daily)
 * via /api/reminders/run, or on demand by an admin.
 */
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import type { Locale } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import { brandingOf } from "@/lib/branding";
import { sendMail, trainingReminderEmail } from "@/lib/email";

export interface ReminderOptions {
  /** Remind when a course is due within this many days (or already overdue). Default 3. */
  soonDays?: number;
  /** Don't re-remind the same enrollment within this many days. Default 3. */
  cooldownDays?: number;
}

export interface ReminderResult {
  tenantId: string;
  candidates: number;
  usersNotified: number;
  emailsSent: number;
}

/** A due-dated, not-yet-complete enrollment considered for a reminder. */
export interface ReminderCandidate {
  id: string;
  userId: string;
  dueAt: Date | null;
  status: string;
  reminderSentAt: Date | null;
}

/**
 * Pure: which candidate enrollments should get a reminder now. An enrollment
 * qualifies when it is not completed, has a due date within `soonDays` (or is
 * overdue), and was not reminded within `cooldownDays`.
 */
export function selectReminders<T extends ReminderCandidate>(
  candidates: T[],
  now: Date,
  opts: ReminderOptions = {}
): T[] {
  const soonDays = opts.soonDays ?? 3;
  const cooldownDays = opts.cooldownDays ?? 3;
  const soonThreshold = now.getTime() + soonDays * 24 * 60 * 60 * 1000;
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;

  return candidates.filter((c) => {
    if (c.status === "COMPLETED" || c.status === "DROPPED") return false;
    if (!c.dueAt) return false;
    if (c.dueAt.getTime() > soonThreshold) return false; // not due yet
    if (c.reminderSentAt && now.getTime() - c.reminderSentAt.getTime() < cooldownMs) {
      return false; // reminded recently
    }
    return true;
  });
}

/** Run reminders for one tenant. Requires no active tenant context. */
export async function runRemindersForTenant(
  tenantId: string,
  opts: ReminderOptions = {}
): Promise<ReminderResult> {
  const now = new Date();
  const result: ReminderResult = {
    tenantId,
    candidates: 0,
    usersNotified: 0,
    emailsSent: 0,
  };

  // Company name + branding + locale (the tenants table is not tenant-scoped).
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      slug: true,
      brandColor: true,
      logoUrl: true,
      locale: true,
    },
  });
  if (!tenant) return result;
  const locale: Locale = tenant.locale === "ar" ? "ar" : "en";
  const brand = brandingOf(tenant);
  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const link = `${base}/training`;

  // Load candidate enrollments (active learners, due within a generous window).
  const soonDays = opts.soonDays ?? 3;
  const windowEnd = new Date(now.getTime() + soonDays * 24 * 60 * 60 * 1000);
  const enrollments = await withTenant(tenantId, (tx) =>
    tx.enrollment.findMany({
      where: {
        status: { notIn: ["COMPLETED", "DROPPED"] },
        dueAt: { not: null, lte: windowEnd },
        user: { status: "ACTIVE" },
      },
      select: {
        id: true,
        userId: true,
        dueAt: true,
        status: true,
        reminderSentAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        program: { select: { title: true, titleAr: true } },
      },
    })
  );

  const due = selectReminders(
    enrollments.map((e) => ({
      id: e.id,
      userId: e.userId,
      dueAt: e.dueAt,
      status: e.status,
      reminderSentAt: e.reminderSentAt,
    })),
    now,
    opts
  );
  result.candidates = due.length;
  if (due.length === 0) return result;

  const dueIds = new Set(due.map((d) => d.id));
  const byUser = new Map<
    string,
    {
      name: string;
      email: string;
      courses: { title: string; due: string; overdue: boolean }[];
    }
  >();
  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  for (const e of enrollments) {
    if (!dueIds.has(e.id) || !e.dueAt) continue;
    const entry =
      byUser.get(e.userId) ??
      {
        name: `${e.user.firstName} ${e.user.lastName}`.trim(),
        email: e.user.email,
        courses: [],
      };
    entry.courses.push({
      title: pickText(e.program.title, e.program.titleAr, locale),
      due: dateFmt.format(e.dueAt),
      overdue: e.dueAt.getTime() < now.getTime(),
    });
    byUser.set(e.userId, entry);
  }

  // Send one digest per user.
  for (const [, u] of byUser) {
    const mail = trainingReminderEmail({
      companyName: tenant.name,
      userName: u.name,
      link,
      courses: u.courses,
      brand: { color: brand.color, logoUrl: brand.logoUrl, initial: brand.initial },
    });
    const { sent } = await sendMail({ to: u.email, ...mail });
    result.usersNotified++;
    if (sent) result.emailsSent++;
  }

  // Mark the reminded enrollments so they are not re-sent within the cooldown.
  await withTenant(tenantId, (tx) =>
    tx.enrollment.updateMany({
      where: { id: { in: [...dueIds] } },
      data: { reminderSentAt: now },
    })
  );

  return result;
}
