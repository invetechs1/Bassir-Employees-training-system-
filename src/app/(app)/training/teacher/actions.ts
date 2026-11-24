"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { runTeacherAgentForTenant } from "@/lib/teacher/pipeline";
import { runRemindersForTenant } from "@/lib/reminders";

export interface TeacherRunState {
  error?: string;
  ok?: boolean;
  summary?: {
    usersProcessed: number;
    usersWithGap: number;
    coursesCreated: number;
    enrollmentsCreated: number;
    enrollmentsSkipped: number;
    llm: number;
    deterministic: number;
  };
}

/** Run the monthly teacher agent for the current company (admin / HR only). */
export async function runTeacherAgentAction(
  _prev: TeacherRunState,
  _formData: FormData
): Promise<TeacherRunState> {
  const session = await requireSession();
  if (!can(session, "training.program.manage")) {
    return { error: "You do not have permission to run the teacher agent." };
  }

  const r = await runTeacherAgentForTenant(session.tenantId);
  revalidatePath("/training");
  revalidatePath("/training/teacher");
  revalidatePath("/training/reports");

  return {
    ok: true,
    summary: {
      usersProcessed: r.usersProcessed,
      usersWithGap: r.usersWithGap,
      coursesCreated: r.coursesCreated,
      enrollmentsCreated: r.enrollmentsCreated,
      enrollmentsSkipped: r.enrollmentsSkipped,
      llm: r.byEngine.llm,
      deterministic: r.byEngine.deterministic,
    },
  };
}

export interface ReminderRunState {
  error?: string;
  ok?: boolean;
  summary?: { candidates: number; usersNotified: number; emailsSent: number };
}

/** Send due/overdue training reminders for the current company now. */
export async function sendRemindersAction(
  _prev: ReminderRunState,
  _formData: FormData
): Promise<ReminderRunState> {
  const session = await requireSession();
  if (!can(session, "training.program.manage")) {
    return { error: "You do not have permission to send reminders." };
  }
  const r = await runRemindersForTenant(session.tenantId);
  revalidatePath("/training");
  return {
    ok: true,
    summary: {
      candidates: r.candidates,
      usersNotified: r.usersNotified,
      emailsSent: r.emailsSent,
    },
  };
}
